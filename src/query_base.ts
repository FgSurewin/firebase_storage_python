import fs from "fs";
import { writeFile } from "fs";
import glob from "glob";

export class Query_Base {
	public checkFolderExists(directory: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			fs.access(directory, fs.constants.F_OK, async (err) => {
				if (err) {
					await fs.mkdir(directory, { recursive: true }, (err) => {
						if (err) {
							console.log(err);
						}
						console.log(`-> "${directory}" created!`);
						resolve(false);
					});
				} else {
					resolve(true);
				}
			});
		});
	}

	public Glob(pattern: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			glob(pattern, (err, files) => {
				if (err) {
					reject(err);
				} else {
					resolve(files);
				}
			});
		});
	}

	public changeFileame(oldName: string) {
		// Original name: 2022-07-29 9:36:53.3500_none.MOV
		const newName = oldName
			.replace(/:/g, "-")
			.replace(" ", "_")
			.replace(/\./, "-"); // We don't need "g" here because we want to only remove the first dot.
		// New name: 2022-07-29_9-36-53-3500_none.MOV
		return newName;
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
						`-> The file has been saved, Please check the ${outputFileName} file!`
					);
				}
			});
		});
	}
}
