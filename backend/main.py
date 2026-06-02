from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
import httpx
import json
import os

app = FastAPI(title="Forensic IR Engine Backend")

app.add_middleware(
    httpx.ASGIMiddleware if hasattr(httpx, 'ASGIMiddleware') else dict,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) if False else None # Middleware is handled cleanly via standard fastAPI setup

from fastapi.middleware.cors import CORSMiddleware
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

# =====================================================================
# THE IMAGE PROXY BYPASS (WITH GRACEFUL FIREWALL FALLBACK)
# =====================================================================
@app.get("/api/image-proxy")
async def proxy_image(url: str):
    if not url or url == "None":
        return Response(status_code=404)
        
    async with httpx.AsyncClient() as client:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Referer": "https://www.fbi.gov/"
            }
            response = await client.get(url, headers=headers, follow_redirects=True, timeout=10)
            
            # THE FIX: If the FBI blocks us with a 403, return a transparent 1x1 pixel 
            # This cleanly tricks the <img> tag into showing your standard background instead of a broken icon
            if response.status_code == 403 or response.status_code == 404:
                transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc`\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
                return Response(content=transparent_pixel, media_type="image/png")
                
            content_type = response.headers.get('Content-Type', 'image/jpeg')
            return Response(content=response.content, media_type=content_type)
            
        except Exception:
            # Fallback to transparent pixel on any connection timeout or drop
            transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc`\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
            return Response(content=transparent_pixel, media_type="image/png")

# =====================================================================
# SYSTEM PACKET ROUTER (EXPANDED GRID COORDINATES)
# =====================================================================
@app.get("/api/cases")
def get_all_cases():
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
    db = load_database()
    target_case = next((c for c in db if c["1_case_core_metadata"]["case_id"] == case_id), None)
    
    if not target_case:
        raise HTTPException(status_code=404, detail="Case not found")

    nodes = []
    edges = []
    
    # 1. Victim (Centered anchor point)
    victims = target_case.get("4_victim_profiles", [])
    if victims:
        v = victims[0]
        nodes.append({
            "id": v["victim_id"],
            "type": "polaroid",
            "position": {"x": 350, "y": 250}, # Lowered initial drop
            "data": {"label": v["full_name"], "type": "victim", "detail": v["demographics"]["physical_description"], "imageUrl": v["portrait_image_url"]}
        })

    # 2. Suspects (Pushed down to y: 750 to allow space for long descriptions)
    for idx, s in enumerate(target_case.get("5_suspects_and_pois", [])):
        y_pos = 250 if "MAIN" in s["person_id"] else 750
        nodes.append({"id": s["person_id"], "type": "polaroid", "position": {"x": 50 + (idx * 240), "y": y_pos}, "data": {"label": s["full_name"], "type": "suspect", "detail": s["legal_status"], "imageUrl": s.get("portrait_image_url")}})

    # 3. Vehicles
    for idx, vh in enumerate(target_case.get("7_vehicles_involved", [])):
        nodes.append({"id": vh["vehicle_id"], "type": "polaroid", "position": {"x": 700, "y": 750}, "data": {"label": vh["make_model"], "type": "vehicle", "detail": vh["distinguishing_features"]}})

    # 4. Location (Pushed down to prevent it from clipping into the victim's chin)
    loc_name = target_case["3_geospatial_data"]["primary_location_name"]
    loc_id = f"LOC-{case_id}"
    nodes.append({"id": loc_id, "type": "polaroid", "position": {"x": 380, "y": 750}, "data": {"label": loc_name, "type": "location", "detail": "Primary Location"}})

    # 5. Physical Evidence Matrix (Expanded row depth from 180 to 280 to stop clipping)
    for idx, evid in enumerate(target_case.get("8_physical_and_forensic_evidence", [])):
        row, col = idx // 2, idx % 2
        nodes.append({
            "id": evid["evidence_id"], 
            "type": "polaroid", 
            "position": {"x": -200 + (col * 240), "y": -50 + (row * 280)}, # Shifted left and vertically expanded
            "data": {"label": "Physical Feature", "type": "evidence", "detail": evid["item_description"]}
        })

    # 6. Witnesses 
    for idx, w in enumerate(target_case.get("6_witnesses_and_informants", [])):
        nodes.append({"id": w["witness_id"], "type": "polaroid", "position": {"x": 50 + (idx * 240), "y": 1150}, "data": {"label": w["full_name"], "type": "witness", "detail": w["statement_summary"]}})

    # 7. Digital & Financial Footprints
    for idx, f in enumerate(target_case.get("9_digital_and_financial_footprints", [])):
        nodes.append({"id": f["footprint_id"], "type": "polaroid", "position": {"x": 650 + (idx * 240), "y": 1150}, "data": {"label": f["record_type"], "type": "digital", "detail": f["description"]}})

    # 8. Red Strings
    for conn in target_case.get("12_red_string_connections", []):
        style = conn.get("style", {"stroke": "#b91c1c"})
        style["strokeWidth"] = 3
        edges.append({
            "id": conn["connection_id"],
            "source": conn["source_node_id"],
            "target": conn["target_node_id"],
            "label": conn["relationship_label"],
            "animated": True,
            "style": style
        })

    return {"nodes": nodes, "edges": edges}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)