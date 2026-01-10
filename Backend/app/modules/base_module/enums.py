from enum import StrEnum


class Role(StrEnum):
    USER = "user"
    HEAD = "head"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"

class TaskType(StrEnum):
    SOLO = "solo"
    GROUP = "group"

class City(StrEnum):
    ALMATY = "almaty"
    ASTANA = "astana"
    SHYMKENT = "shymkent"
    KARAGANDA = "karaganda"
    AKTOBE = "aktobe"
    TARAZ = "taraz"
    PAVLODAR = "pavlodar"
    OSKEMEN = "oskemen"
    SEMEY = "semey"
    KOSTANAY = "kostanay"
    KYZYLORDA = "kyzylorda"
    ATYRAU = "atyrau"
    ORAL = "oral"
    PETROPAVL = "petropavl"
    TURKISTAN = "turkistan"

class TaskStep(StrEnum):
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"
    FAILED = "failed"

