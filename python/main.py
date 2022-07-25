import os
import requests


def get_video_root():
    ROOT = os.path.abspath(os.path.curdir)
    VIDEO_ROOT = os.path.join(ROOT, "videos")
    return VIDEO_ROOT


def get_acc_root():
    ROOT = os.path.abspath(os.path.curdir)
    ACC_ROOT = os.path.join(ROOT, "acc_files")
    return ACC_ROOT


def download_video_from_url(url, file_name):
    video_root = get_video_root()
    file_path = os.path.join(video_root, file_name)
    r = requests.get(url, stream=True)
    with open(file_path, "wb") as f:
        for ch in r:
            f.write(ch)
    print(f"Download completed - {file_path}")


def download_acc_from_url(url, file_name):
    acc_root = get_acc_root()
    file_path = os.path.join(acc_root, file_name)
    r = requests.get(url, stream=True)
    with open(file_path, "wb") as f:
        for ch in r:
            f.write(ch)
    print(f"Download completed - {file_path}")


if __name__ == "__main__":
    print(get_video_root())
