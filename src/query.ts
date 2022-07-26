import {
  ref,
  listAll,
  getDownloadURL,
  StorageReference,
} from "firebase/storage";
import { storage } from "./firebase";
import { writeFile } from "fs";
import Downloader from "nodejs-file-downloader";
import cliProgress from "cli-progress";
import colors from "ansi-colors";
import fs from "fs";
import path from "path";

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
  public storageDirectory: string;
  public rootDirectory: string;
  public outputFolderName: string;
  public users: string[];
  public output: Output;
  public acc_and_videos: FileNameAndUrl[];

  constructor(
    storageDirectory: string,
    rootDirectory: string,
    outputFolderName: string
  ) {
    // const currentFileName = "/dev/users";
    this.storageDirectory = storageDirectory;
    this.rootDirectory = rootDirectory;
    this.outputFolderName = outputFolderName;
    this.storageRef = ref(storage, storageDirectory);
    this.users = [];
    this.output = {};
    this.acc_and_videos = [];
  }

  /* --------------------------- Initialize & utils --------------------------- */
  public async init() {
    await this.checkFolderExists(
      path.join(this.rootDirectory, this.outputFolderName)
    );
    // console.log("Querying all files...");
    // await this.queryAllUsers();
    // await this.queryAllFiles();
    // console.log("Done!");
    // const msg_1 = await this.writeToFile(
    //   JSON.stringify(this.output),
    //   path.join(
    //     this.rootDirectory,
    //     this.outputFolderName,
    //     "output.json"
    //   )
    // );
    // console.log(msg_1);
    await this.getFileNameAndUrl();
    const msg_2 = await this.writeToFile(
      JSON.stringify(this.acc_and_videos),
      path.join(this.rootDirectory, this.outputFolderName, "all_files.json")
    );
    console.log(msg_2);
  }

  public changeUserName(oldName: string) {
    const newName = oldName.replace(/:/g, "-").replace(" ", "_");
    const newNameArr = newName.split(".");
    const finalName = newNameArr[0] + "-" + newNameArr[1] + "." + newNameArr[2];
    return finalName;
  }

  /* ---------------------------------- Users --------------------------------- */
  /**
   * Query all users in the storage
   */
  public async queryAllUsers() {
    const listResult = await listAll(this.storageRef);
    for (let prefix of listResult.prefixes) {
      this.users.push(prefix.name);
    }
  }

  /**
   * Return all users.
   * @returns Promise<string[]>
   */
  public async getAllUsers() {
    return this.users;
  }
  /* ------------------------------------ - ----------------------------------- */

  /* ---------------------------- Get csvs and videos --------------------------- */
  public async getUserVideos(user: string) {
    const userRef = ref(this.storageRef, `/${user}/video`);
    const listResult = await listAll(userRef);
    const videos: FileNameAndUrl[] = [];
    for (let file of listResult.items) {
      const url = await getDownloadURL(file);
      videos.push({
        fileName: this.changeUserName(file.name),
        url,
        type: "MOV",
        userName: user,
        prefix: "video",
      });
    }
    // console.log(`${user} - Video -> Done`);
    return videos;
  }

  public async getUserCsvs(user: string) {
    const userRef = ref(this.storageRef, `/${user}/csv`);
    const listResult = await listAll(userRef);
    const csvs: FileNameAndUrl[] = [];
    for (let file of listResult.items) {
      const url = await getDownloadURL(file);
      csvs.push({
        fileName: this.changeUserName(file.name),
        url,
        type: "csv",
        userName: user,
        prefix: "csv",
      });
    }
    // console.log(`${user} - CSV -> Done`);
    return csvs;
  }

  public async queryAllFiles() {
    for (let user of this.users) {
      const videos = await this.getUserVideos(user);
      const csvs = await this.getUserCsvs(user);
      this.output[user] = { video: videos, csv: csvs };
    }
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
          fileName: this.changeUserName(file.name),
          url,
          type,
          userName: pathArr[2],
          prefix: pathArr[3],
        });
      }
    }
  }

  public async getFileNameAndUrl() {
    console.log("Querying all files in one single array...");
    await this.getFileNameAndUrlRecursively(this.storageRef);
    console.log("Done!");
    return this.acc_and_videos;
  }

  /* ------------------------------------ - ----------------------------------- */

  /* ------------------------------- File system ------------------------------ */
  public writeToFile(data: string, outputFileName: string) {
    return new Promise((resolve, reject) => {
      writeFile(outputFileName, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            `The file has been saved, Please check the ${outputFileName} file!`
          );
        }
      });
    });
  }

  public checkFolderExists(directory: string) {
    return new Promise((resolve, reject) => {
      fs.access(directory, fs.constants.F_OK, async (err) => {
        if (err) {
          await fs.mkdir(directory, { recursive: true }, (err) => {
            if (err) {
              console.log(err);
            }
            console.log(`"${directory}" created!`);
            resolve(false);
          });
        } else {
          resolve(true);
        }
      });
    });
  }

  /* ------------------------------------ - ----------------------------------- */

  /* ------------------------------- Downloader ------------------------------- */
  public async downloadFile(
    url: string,
    directory: string,
    fileName: string,
    fileIdx: number | null = null
  ) {
    const barFormat =
      fileIdx === null
        ? `${colors.cyan(
            "{bar}"
          )} | {percentage}% | {value}/{total} chunks | ${fileName}`
        : `Files (${fileIdx + 1}/${
            this.acc_and_videos.length
          }) || ${colors.cyan(
            "{bar}"
          )} | {percentage}% || {value}/{total} chunks | ${fileName}`;
    const b1 = new cliProgress.SingleBar({
      format: barFormat,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: false,
    });
    b1.start(100, 0);
    const downloader = new Downloader({
      url,
      directory, //Sub directories will also be automatically created if they do not exist.
      fileName,
      onProgress: function (percentage, chunk, remainingSize) {
        //Gets called with each chunk.
        // console.log("% ", percentage);
        // console.log("Current chunk of data: ", chunk);
        // console.log("Remaining bytes: ", remainingSize);
        b1.update(Number(percentage));
      },
    });

    try {
      await downloader.download();
      b1.stop();
    } catch (error) {
      console.log(error);
    }
  }

  public async downloadAllFiles() {
    for (let idx = 0; idx < this.acc_and_videos.length; idx++) {
      const directory = path.join(
        this.rootDirectory,
        this.outputFolderName,
        this.acc_and_videos[idx].userName,
        this.acc_and_videos[idx].prefix
      );
      const fileName = this.acc_and_videos[idx].fileName;
      await this.checkFolderExists(directory);
      await this.downloadFile(
        this.acc_and_videos[idx].url,
        directory,
        fileName,
        idx
      );
    }
  }
}
