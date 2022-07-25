import { Query } from "./query";

async function main() {
  /* -------------------------------------------------------------------------- */
  /*                                 Instruction                                */
  /* -------------------------------------------------------------------------- */
  /**
   * How to use Query class:
   * 1. Create an instance of Query class
   * 2. Call init() method to initialize the class
   *
   * Useful methods:
   * 1. Call getAllUsers() method to get all users.
   * 2. Call getUserVideos(user: StorageReference) method to get all videos of a user.
   * 3. Call getUserCSV(user: StorageReference) method to get all csv files of a user.
   * 4. Call writeToFile(data, outputFileName) method to write data to a file.
   * 5. call getFileNameAndUrl() method to get all files recursively.
   *
   * Note:
   * The output.json file will be generated in the `output` directory
   * when you initialize the class with init() method.
   * if the output.json file already exists, it will be overwritten.
   * Also, if the output.json file is not generated, you can call the writeToFile(data, outputFileName) method to generate it.
   * By the way, you can use writeToFile(data, outputFileName) method to generate whatever files you want.
   */

  /* ------------------------------ Basic Usage: ------------------------------ */
  const queryInstance = new Query();
  await queryInstance.init();

  /* ----------------------------- Advanced Usage: ---------------------------- */
  const allFiles = await queryInstance.getFileNameAndUrl();
  queryInstance.writeToFile(
    JSON.stringify(allFiles),
    "./output/all_files.json"
  );
  console.log("all_files.json -> Done");
}

main();
