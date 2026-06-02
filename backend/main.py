from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="Forensic IR Engine Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "master_forensic_database.json")

def load_database():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database file not found locally.")
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/cases")
def get_all_cases():
    """Returns a dropdown list of all 1,000 cases for the UI selection sidebar."""
    db = load_database()
    return [
        {
            "case_id": case["1_case_core_metadata"]["case_id"],
            "case_title": case["1_case_core_metadata"]["case_title"],
            "location": case["3_geospatial_data"]["primary_location_name"]
        }
        for case in db
    ]

@app.get("/api/graph/{case_id}")
def get_case_graph(case_id: str):
    """Generates the React Flow Nodes and Edges dynamically from the 13-field data."""
    db = load_database()
    target_case = next((c for c in db if c["1_case_core_metadata"]["case_id"] == case_id), None)
    
    if not target_case:
        raise HTTPException(status_code=404, detail="Case not found")

    nodes = []
    edges = []
    
    # 1. Add Victim Node (Anchor Point)
    victims = target_case["4_victim_profiles"]
    if victims:
        v = victims[0]
        nodes.append({
            "id": v["victim_id"],
            "type": "polaroid",
            "position": {"x": 350, "y": 150},
            "data": {"label": v["full_name"], "type": "victim", "detail": v["demographics"]["physical_description"], "imageUrl": v["portrait_image_url"]}
        })

    # 2. Add Suspect Nodes (Positioned cleanly below the victim)
    suspects = target_case["5_suspects_and_pois"]
    for idx, s in enumerate(suspects):
        s_id = s["person_id"]
        nodes.append({
            "id": s_id,
            "type": "polaroid",
            "position": {"x": 100 + (idx * 240), "y": 500},
            "data": {"label": s["full_name"], "type": "suspect", "detail": s["legal_status"]}
        })

    # 3. Add Vehicle Nodes
    vehicles = target_case["7_vehicles_involved"]
    for idx, vh in enumerate(vehicles):
        vh_id = vh["vehicle_id"]
        nodes.append({
            "id": vh_id,
            "type": "polaroid",
            "position": {"x": 700, "y": 500},
            "data": {"label": vh["make_model"], "type": "vehicle", "detail": vh["distinguishing_features"]}
        })

    # 4. Add Location Node
    loc_name = target_case["3_geospatial_data"]["primary_location_name"]
    loc_id = f"LOC-{case_id}"
    nodes.append({
        "id": loc_id,
        "type": "polaroid",
        "position": {"x": 350, "y": 500},
        "data": {"label": loc_name, "type": "location", "detail": "Primary Location of Disappearance"}
    })

    # 5. Add Physical Evidence Nodes (TIGHT COMPACT ROW/COLUMN LAYOUT)
    evidence_items = target_case.get("8_physical_and_forensic_evidence", [])
    for idx, evid in enumerate(evidence_items):
        evid_id = evid["evidence_id"]
        
        # Calculate a structured horizontal layout left of the victim card
        # Stacks up to 2 items per row to keep things incredibly tight
        row = idx // 2
        col = idx % 2
        x_pos = 50 + (col * 230)
        y_pos = -50 + (row * 180)
        
        nodes.append({
            "id": evid_id,
            "type": "polaroid",
            "position": {"x": x_pos, "y": y_pos},
            "data": {
                "label": "Physical Characteristics", 
                "type": "evidence", 
                "detail": evid["item_description"]
            }
        })

    # 6. Map Internal Case Connections (Red Strings)
    for conn in target_case["12_red_string_connections"]:
        edges.append({
            "id": conn["connection_id"],
            "source": conn["source_node_id"],
            "target": conn["target_node_id"],
            "label": conn["relationship_label"],
            "animated": True,
            "style": {"stroke": "#b91c1c", "strokeWidth": 3}
        })

    # 7. CROSS-CASE ANALYSIS (Link to other cases sharing same characteristics)
    for other_case in db:
        other_id = other_case["1_case_core_metadata"]["case_id"]
        if other_id == case_id:
            continue
            
        if other_case["3_geospatial_data"]["primary_location_name"] == loc_name and loc_name != "Unknown":
            other_title = other_case["1_case_core_metadata"]["case_title"]
            ext_node_id = f"EXT-{other_id}"
            
            nodes.append({
                "id": ext_node_id,
                "type": "polaroid",
                "position": {"x": 750, "y": -50},
                "data": {"label": f"Linked Case: {other_title}", "type": "location", "detail": f"Also disappeared from {loc_name}"}
            })
            
            edges.append({
                "id": f"CROSS-{case_id}-{other_id}",
                "source": loc_id,
                "target": ext_node_id,
                "label": "Geospatial Pattern",
                "style": {"stroke": "#eab308", "strokeWidth": 3, "strokeDasharray": "5 5"}
            })
            break 

    return {"nodes": nodes, "edges": edges}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)