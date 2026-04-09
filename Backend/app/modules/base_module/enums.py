from enum import StrEnum, Enum, IntEnum


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

class PeriodType(IntEnum):
    DAY = 1
    WEEK = 7
    MONTH = 30
    SIX_MONTH = 180
    YEAR = 365
    ALL = 1000000

class Rank(StrEnum):
    S = "s"
    A = "a"
    B = "b"
    C = "c"

class QualityStatus(StrEnum):
    VERIFIED = "verified"
    FAILED = "failed"

class Priority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


