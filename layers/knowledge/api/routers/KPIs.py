from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import UUID
from schemas.KPIs import (
    KPIsR,
    QualitativeKPIC,
    QuantitativeKPIC,
    QualitativeKPIU,
    QuantitativeKPIU,
    KPIType
)
from connections import my_db

router = APIRouter(
    prefix="/kpi",
    tags=["kpi"],
    responses={404: {"description": "Not found"}},
)

# Read Operations
@router.get("/qualitative", name="Get Qualitative KPIs", response_model=List[KPIsR])
async def get_qualitative_kpis():
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT uuid, key, type, value FROM kpis WHERE type = 'qualitative'"
    )
    result = cursor.fetchall()
    kpis = [
        KPIsR(
            uuid=row['uuid'],
            key=row['key'],
            type=KPIType.qualitative,
            value=row['value']
        ) for row in result
    ]
    cursor.close()
    conn.close()
    return kpis

@router.get("/quantitative", name="Get Quantitative KPIs", response_model=List[KPIsR])
async def get_quantitative_kpis():
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT uuid, key, type, value FROM kpis WHERE type = 'quantitative'"
    )
    result = cursor.fetchall()
    kpis = [
        KPIsR(
            uuid=row['uuid'],
            key=row['key'],
            type=KPIType.quantitative,
            value=row['value']
        ) for row in result
    ]
    cursor.close()
    conn.close()
    return kpis

@router.get("/{uuid}", name="Get KPI by UUID", response_model=KPIsR)
async def get_kpi(uuid: UUID):
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT uuid, key, type, value FROM kpis WHERE uuid = %s",
        (str(uuid),)
    )
    result = cursor.fetchone()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI not found"
        )
    kpi = KPIsR(
        uuid=result['uuid'],
        key=result['key'],
        type=result['type'],
        value=result['value']
    )
    cursor.close()
    conn.close()
    return kpi

# Create Operations
@router.post("/qualitative", name="Create Qualitative KPI", response_model=KPIsR)
async def create_qualitative_kpi(kpi: QualitativeKPIC):
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO kpis (type, key) VALUES ('qualitative', %s) RETURNING uuid, key, type, value",
        (kpi.key,)
    )
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return KPIsR(
        uuid=result['uuid'],
        key=result['key'],
        type=KPIType.qualitative,
        value=result['value']
    )

@router.post("/quantitative", name="Create Quantitative KPI", response_model=KPIsR)
async def create_quantitative_kpi(kpi: QuantitativeKPIC):
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO kpis (type, key, value) VALUES ('quantitative', %s, %s) RETURNING uuid, key, type, value",
        (kpi.key, kpi.value)
    )
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return KPIsR(
        uuid=result['uuid'],
        key=result['key'],
        type=KPIType.quantitative,
        value=result['value']
    )

# Update Operations
@router.put("/qualitative/{uuid}", name="Update Qualitative KPI", response_model=KPIsR)
async def update_qualitative_kpi(uuid: UUID, kpi: QualitativeKPIU):
    conn = my_db()
    cursor = conn.cursor()
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = []
    if kpi.key is not None:
        update_fields.append("key = %s")
        params.append(kpi.key)
    if kpi.value is not None:
        update_fields.append("value = %s")
        params.append(kpi.value)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    query = f"""
        UPDATE kpis 
        SET {', '.join(update_fields)}
        WHERE uuid = %s AND type = 'qualitative'
        RETURNING uuid, key, type, value
    """
    params.append(str(uuid))
    
    cursor.execute(query, params)
    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI not found"
        )
    
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    return KPIsR(
        uuid=result['uuid'],
        key=result['key'],
        type=KPIType.qualitative,
        value=result['value']
    )

@router.put("/quantitative/{uuid}", name="Update Quantitative KPI", response_model=KPIsR)
async def update_quantitative_kpi(uuid: UUID, kpi: QuantitativeKPIU):
    conn = my_db()
    cursor = conn.cursor()
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = []
    if kpi.key is not None:
        update_fields.append("key = %s")
        params.append(kpi.key)
    if kpi.value is not None:
        update_fields.append("value = %s")
        params.append(kpi.value)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    query = f"""
        UPDATE kpis 
        SET {', '.join(update_fields)}
        WHERE uuid = %s AND type = 'quantitative'
        RETURNING uuid, key, type, value
    """
    params.append(str(uuid))
    
    cursor.execute(query, params)
    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI not found"
        )
    
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    return KPIsR(
        uuid=result['uuid'],
        key=result['key'],
        type=KPIType.quantitative,
        value=result['value']
    )

# Delete Operations
@router.delete("/{uuid}", name="Delete KPI", status_code=status.HTTP_204_NO_CONTENT)
async def delete_kpi(uuid: UUID):
    conn = my_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM kpis WHERE uuid = %s",
        (str(uuid),)
    )
    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI not found"
        )
    conn.commit()
    cursor.close()
    conn.close()