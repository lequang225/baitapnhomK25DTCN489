"""Điểm khởi động ứng dụng.

    python main.py                 # mở giao diện đồ hoạ (Tkinter)
    python main.py --cli ...       # chạy thực nghiệm ở chế độ dòng lệnh
"""

import sys


def main() -> None:
    if "--cli" in sys.argv:
        argv = [a for a in sys.argv[1:] if a != "--cli"]
        from app.cli import main as cli_main
        cli_main(argv)
        return

    try:
        from app.gui import main as gui_main
    except ImportError:
        print("Khong tim thay Tkinter. Cai dat:")
        print("  Ubuntu/Debian : sudo apt install python3-tk")
        print("  Windows/macOS : Tkinter co san trong ban Python chinh thuc (python.org)")
        print("Hoac chay che do dong lenh: python main.py --cli --mode graph")
        sys.exit(1)

    gui_main()


if __name__ == "__main__":
    main()
