from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from schemas.Common import CommonResponse
from connections import my_db
import uuid

router = APIRouter(
    prefix="/kpi",
    tags=["kpi"],
    responses={404: {"description": "Not found"}},
)

@router.get("/qualitative", name="Get Qualitative KPIs", response_model=CommonResponse)
async def qualitative_get():
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute("SELECT uuid, value FROM kpis WHERE type = 'qualitative'")
    result = cursor.fetchall()
    kpis = [{"uuid": str(row['uuid']), "value": row['value']} for row in result]
    cursor.close()
    conn.close()
    return {"data": kpis}

@router.post("/qualitative/{kpi}", name="Create Qualitative KPI", response_model=CommonResponse)
async def qualitative_post(kpi: str):
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO kpis (type, value) VALUES ('qualitative', %s) RETURNING uuid",
        (kpi,)
    )
    kpi_uuid = cursor.fetchone()['uuid']
    conn.commit()
    cursor.close()
    conn.close()
    return {"data": {"uuid": str(kpi_uuid), "value": kpi}}

@router.delete("/qualitative/{uuid}", name="Delete Qualitative KPI", response_model=CommonResponse)
async def qualitative_delete(uuid: str):
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM kpis WHERE uuid = %s AND type = 'qualitative'",
            (uuid,)
        )
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="KPI not found"
            )
        conn.commit()
        cursor.close()
        conn.close()
        return {"data": {"message": "KPI deleted successfully"}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/quantitative", name="Get Quantitative KPIs", response_model=CommonResponse)
async def quantitative_get():
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute("SELECT uuid, value FROM kpis WHERE type = 'quantitative'")
        result = cursor.fetchall()
        kpis = [{"uuid": str(row['uuid']), "value": row['value']} for row in result]
        cursor.close()
        conn.close()
        return {"data": kpis}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/quantitative/{kpi}", name="Create Quantitative KPI", response_model=CommonResponse)
async def quantitative_post(kpi: str):
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO kpis (type, value) VALUES ('quantitative', %s) RETURNING uuid",
            (kpi,)
        )
        kpi_uuid = cursor.fetchone()['uuid']
        conn.commit()
        cursor.close()
        conn.close()
        return {"data": {"uuid": str(kpi_uuid), "value": kpi}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/quantitative/{uuid}", name="Delete Quantitative KPI", response_model=CommonResponse)
async def quantitative_delete(uuid: str):
    try:
        conn = my_db()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM kpis WHERE uuid = %s AND type = 'quantitative'",
            (uuid,)
        )
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="KPI not found"
            )
        conn.commit()
        cursor.close()
        conn.close()
        return {"data": {"message": "KPI deleted successfully"}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
