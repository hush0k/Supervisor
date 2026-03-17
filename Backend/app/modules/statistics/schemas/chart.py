from pydantic import BaseModel
from datetime import date


class ChartPoint(BaseModel):
    date: date
    value:float | int

class ChartDataResponse(BaseModel):
    metric: str
    data: list[ChartPoint]