import os
from time import sleep
from tqdm import tqdm
import json
import requests


class Downloader:
    def __init__(self, download_info, download_folder):
        self.download_info = download_info
        self.download_folder = download_folder

    def download(self, url, user_name, prefix, file_name):
        root = os.path.abspath(os.path.curdir)
        file_path = os.path.join(
            root, self.download_folder, user_name, prefix, file_name
        )
        r = requests.get(url, stream=True)
        with open(file_path, "wb") as f:
            for ch in tqdm(r):
                f.write(ch)

    def check_folder(self, folder_name):
        root = os.path.abspath(os.path.curdir)
        folder_path = os.path.join(root, folder_name)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

    def read_json(self):
        with open(self.download_info, "r") as f:
            self.data = list(json.load(f))
            print(len(self.data))

    def download_all(self):
        self.check_folder(self.download_folder)
        self.read_json()
        t = tqdm(range(len(self.data)), bar_format="{l_bar}{bar:30}{r_bar}{bar:-30b}")
        for idx in t:
            self.check_folder(
                os.path.join(self.download_folder, self.data[idx]["userName"])
            )
            self.check_folder(
                os.path.join(
                    self.download_folder,
                    self.data[idx]["userName"],
                    self.data[idx]["prefix"],
                )
            )
            t.set_description(
                f"User:{self.data[idx].get('userName')} | File Name:{self.data[idx].get('fileName')} (file {idx + 1})"
            )
            t.refresh()
            # sleep(5)
            self.download(
                self.data[idx].get("url"),
                self.data[idx].get("userName"),
                self.data[idx].get("prefix"),
                self.data[idx].get("fileName"),
            )


if __name__ == "__main__":
    # t = tqdm(range(20), bar_format="{l_bar}{bar:30}{r_bar}{bar:-30b}")
    # for i in t:
    #     t.set_description("Bar desc (file %i)" % i)
    #     # t.refresh()  # to show immediately the update
    #     sleep(0.1)
    url = "https://firebasestorage.googleapis.com/v0/b/sidewalkproject-cb352.appspot.com/o/dev%2Fusers%2F2148C602-7506-4BE0-8C2E-9EF25AEEB2AA%2Fcsv%2F2022-07-22%2019%3A22%3A28.9650.csv?alt=media&token=bfcd2b15-b69d-4c3f-a9ff-d00418bb25bb"
    user = "2148C602-7506-4BE0-8C2E-9EF25AEEB2AA"
    file_name = "19_22_28_9650.csv"
    prifix = "csv"
    download_info = "./output/test.json"
    download_folder = "files"
    downloader = Downloader(download_info, download_folder)
    downloader.download(url, user, prifix, file_name)
