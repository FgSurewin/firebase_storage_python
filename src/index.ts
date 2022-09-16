import { Query } from "./query";
import { prompt } from "inquirer";
import { config } from "./config";
const { storageDirectory, rootDirectory, outputFolderName } = config;
import { db } from "./firebase";
import { getDoc, doc } from "firebase/firestore";
import { Query_Firestore } from "./query_database";
import cliProgress from "cli-progress";

async function query_from_storage() {
	/* -------------------------------------------------------------------------- */
	/*                                 Instruction                                */
	/* -------------------------------------------------------------------------- */
	/**
	 * How to use Query class:
	 * 1. Create an instance of Query class
	 * 2. Call download() method to download the files.
	 *
	 * Useful methods:
	 * 1. Call getAllUsers() method to get all users.
	 * 2. Call getUserVideos(user: StorageReference) method to get all videos of a user.
	 * 3. Call getUserCSV(user: StorageReference) method to get all csv files of a user.
	 * 4. Call writeToFile(data, outputFileName) method to write data to a file.
	 * 5. Call getFileNameAndUrl() method to get all files recursively.
	 *
	 *
	 * Note:
	 * The all_files.json file will be generated in the `output` directory
	 * when you initialize the class with init() method.
	 * if the all_files.json file already exists, it will be overwritten.
	 * Also, if the all_files.json file is not generated, you can call the writeToFile(data, outputFileName) method to generate it.
	 * By the way, you can use writeToFile(data, outputFileName) method to generate whatever files you want.
	 */

	/* ------------------------------ Basic Usage: ------------------------------ */
	const queryInstance = new Query(
		storageDirectory,
		rootDirectory,
		outputFolderName
	);
	await queryInstance.download();
	console.log("-> End!");
}

async function query_from_firestore() {
	const usersRef = doc(db, "users", "authenticated_users");
	const usersSnap = await getDoc(usersRef);
	const usersRes = usersSnap.data() as { user_list: string[] };
	const choices = [...usersRes.user_list, "all"];
	const queryInstance = new Query_Firestore(
		storageDirectory,
		rootDirectory,
		outputFolderName,
		usersRes.user_list
	);
	console.log(
		"-> Please select a user to query his/her files or select 'all' to query all files):"
	);
	const result = await prompt([
		{
			type: "list",
			name: "user",
			choices: choices,
			loop: false,
		},
	]);
	queryInstance.query(result.user);
}

// query_from_storage();
query_from_firestore();
