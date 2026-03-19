import logging
import sys


def setup_logging() -> None:
    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(fmt)

    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)

    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn.access").propagate = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)