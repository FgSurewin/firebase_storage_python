import {
  ref,
  listAll,
  getDownloadURL,
  StorageReference,
} from "firebase/storage";
import { storage } from "./firebase";
import { writeFile } from "fs";

interface FileNameAndUrl {
  fileName: string;
  url: string;
  type: "csv" | "MOV";
  userName: string;
  prefix: string;
}

interface User {
  video: FileNameAndUrl[];
  csv: FileNameAndUrl[];
}

interface Output {
  [key: string]: User;
}

export class Query {
  private storageRef: StorageReference;
  public users: string[];
  public output: Output;
  public acc_and_videos: FileNameAndUrl[];

  constructor() {
    const currentFileName = "/dev/users";
    this.storageRef = ref(storage, currentFileName);
    this.users = [];
    this.output = {};
    this.acc_and_videos = [];
  }

  public async init() {
    await this.queryAllUsers();
    await this.queryAllFiles();
    const msg = await this.writeToFile(JSON.stringify(this.output));
    console.log(msg);
  }

  public async queryAllUsers() {
    const listResult = await listAll(this.storageRef);
    for (let prefix of listResult.prefixes) {
      this.users.push(prefix.name);
    }
  }

  public async getAllUsers() {
    return this.users;
  }

  public async getUserVideos(user: string) {
    const userRef = ref(this.storageRef, `/${user}/video`);
    const listResult = await listAll(userRef);
    const videos: FileNameAndUrl[] = [];
    for (let file of listResult.items) {
      const url = await getDownloadURL(file);
      videos.push({
        fileName: file.name,
        url,
        type: "MOV",
        userName: user,
        prefix: "video",
      });
    }
    console.log(`${user} - Video -> Done`);
    return videos;
  }

  public async getUserCsvs(user: string) {
    const userRef = ref(this.storageRef, `/${user}/csv`);
    const listResult = await listAll(userRef);
    const csvs: FileNameAndUrl[] = [];
    for (let file of listResult.items) {
      const url = await getDownloadURL(file);
      csvs.push({
        fileName: file.name,
        url,
        type: "csv",
        userName: user,
        prefix: "csv",
      });
    }
    console.log(`${user} - CSV -> Done`);
    return csvs;
  }

  public async queryAllFiles() {
    for (let user of this.users) {
      const videos = await this.getUserVideos(user);
      const csvs = await this.getUserCsvs(user);
      this.output[user] = { video: videos, csv: csvs };
    }
  }

  public writeToFile(
    data: string,
    outputFileName: string = "./output/output.json"
  ) {
    return new Promise((resolve, reject) => {
      writeFile(outputFileName, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            "The file has been saved, Please check the output.json file!"
          );
        }
      });
    });
  }

  public async getFileNameAndUrlRecursively(ref: StorageReference) {
    const listFiles = await listAll(ref);
    if (listFiles.prefixes.length > 0) {
      for (let prefix of listFiles.prefixes) {
        await this.getFileNameAndUrlRecursively(prefix);
      }
    } else {
      for (let file of listFiles.items) {
        const url = await getDownloadURL(file);
        const type = file.name.split(".")[2] === "csv" ? "csv" : "MOV";
        const pathArr = file.fullPath.split("/");
        this.acc_and_videos.push({
          fileName: file.name,
          url,
          type,
          userName: pathArr[2],
          prefix: pathArr[3],
        });
      }
    }
  }

  public async getFileNameAndUrl() {
    await this.getFileNameAndUrlRecursively(this.storageRef);
    return this.acc_and_videos;
  }
}
