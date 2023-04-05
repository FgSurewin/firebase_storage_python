import colors from "ansi-colors";
import cliProgress from "cli-progress";
import { Query_Base } from "./query_base";
import { db, storage } from "./firebase";
import { collection, getDocs, Firestore } from "firebase/firestore";
import Downloader from "nodejs-file-downloader";
import { FirebaseStorage, getDownloadURL, ref } from "firebase/storage";
import path from "path";

interface UserData {
  account: {
    email: string;
    name: string;
    orgniization: string;
    "phone name": string;
  };
  createdAt: string;
  videoInfo: {
    videoDuration: number;
    videoURL: string[];
    endTime: string;
    startTime: string;
    videoSegementTimestamp: string[];
  };
  uniqueIdentifier: string;
  category: string;
  sensorDataURL: string[];
  slowMode: boolean;
}

interface IRecord {
  category: string;
  videoURL: string;
  sensorDataURL: string;
}

export class Query_Firestore extends Query_Base {
  private db: Firestore;
  private storage: FirebaseStorage;
  public storageDirectory: string;
  public rootDirectory: string;
  public outputFolderName: string;
  public users: string[];

  constructor(
    storageDirectory: string,
    rootDirectory: string,
    outputFolderName: string,
    users: string[]
  ) {
    super();
    this.db = db;
    this.storage = storage;
    this.storageDirectory = storageDirectory;
    this.rootDirectory = rootDirectory;
    this.outputFolderName = outputFolderName;
    this.users = users;
  }

  public async query(user: string) {
    // TODO Check if the output folder exists
    await this.checkFolderExists(
      path.join(this.rootDirectory, this.outputFolderName)
    );
    if (user === "all") {
      // TODO Query all files
      console.log("-> Downloading all files");
    } else {
      await this.queryOneUser(user);
    }
  }

  public async queryOneUser(user: string) {
    const userRef = collection(db, "users", "user_data", user);
    const usersnap = await getDocs(userRef);
    const files = usersnap.docs.map((doc) => doc.data() as UserData);
    // TODO Check if the files are already downloaded
    const VideoPattern = `${this.rootDirectory}/${this.outputFolderName}/${user}/*.MOV`;
    const oldVideoFiles = await this.Glob(VideoPattern);
    // Get filenames
    const oldVideoFilesNames = oldVideoFiles.map((file) => {
      const filename = file.split("/").pop() as string;
      return filename;
    });
    const newFiles: IRecord[] = [];
    files.forEach((file) => {
      if (
        file.createdAt !== undefined &&
        file.videoInfo.videoURL.length === file.sensorDataURL.length
      ) {
        const videoURLs = file.videoInfo.videoURL;
        const sensorDataURLs = file.sensorDataURL;
        const category = file.category;
        const length = file.videoInfo.videoURL.length;
        for (let i = 0; i < length; i++) {
          const videoFileName = videoURLs[i].split("/").pop() as string;
          if (!oldVideoFilesNames.includes(this.changeFileame(videoFileName))) {
            newFiles.push({
              category: category,
              videoURL: videoURLs[i],
              sensorDataURL: sensorDataURLs[i],
            });
          }
        }
      }
    });

    // const oldFilesTimestamps = oldFiles.map((file) => {
    //   const filename = file.split("/").pop() as string;
    //   const timestampArr = filename.split("_");
    //   const timestamp = timestampArr[0] + "_" + timestampArr[1];
    //   return timestamp;
    // });
    // const newFiles = files.filter((file) => {
    //   //   console.log(file.createdAt);
    //   if (file.createdAt === undefined) return false;
    //   const timestamp = this.changeFileame(file.createdAt);
    //   return !oldFilesTimestamps.includes(timestamp);
    // });
    console.log(
      `-> File Report |Total: ${newFiles.length} | New: ${newFiles.length} | Exist: ${oldVideoFiles.length}`
    );
    // TODO Download new files
    await this.downloadAllFiles(newFiles, user);
  }

  public async getURL(gs: string): Promise<string> {
    const gsRef = ref(this.storage, gs);
    const url = await getDownloadURL(gsRef);
    return url;
  }

  public async downloadAllFiles(files: IRecord[], user: string) {
    // TODO Check if the user folder exists
    const directory = path.join(
      this.rootDirectory,
      this.outputFolderName,
      user
    );
    await this.checkFolderExists(directory);
    // Define progress bar
    const progressBar = new cliProgress.SingleBar({
      format:
        "-> Downloading |" +
        colors.cyan("{bar}") +
        "| {percentage}% || {value}/{total} Chunks || Speed: {speed}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });
    progressBar.start(files.length, 0);
    for (const file of files) {
      // TODO Download csv file
      const csvURL = await this.getURL(file.sensorDataURL);
      const csvFileName = this.changeFileame(
        file.sensorDataURL.split("/").pop() as string
      );
      await this.downloadFile(csvURL, directory, csvFileName);
      // TODO Download video file
      const videoURL = await this.getURL(file.videoURL);
      const videoFileName = this.changeFileame(
        file.videoURL.split("/").pop() as string
      );
      await this.downloadFile(videoURL, directory, videoFileName);
      // TODO Update progress bar
      progressBar.increment();
    }
    progressBar.stop();
    console.log(
      `-> Download finished | ${files.length} files downloaded | User: ${user}`
    );
  }

  public async downloadFile(url: string, directory: string, fileName: string) {
    const downloader = new Downloader({
      url,
      directory, //Sub directories will also be automatically created if they do not exist.
      fileName,
    });

    try {
      await downloader.download();
    } catch (error) {
      console.log(error);
    }
  }
}
