# Downloader of Firebase Storage

This is a tool for those who want to quickly download all files saved on Firebase storage. In order to run the tool, the only thing you need to do is modifying the configureation parameters. Follow the instruction below to start running the tool. :)

## 1. Make sure you have `Node.js` on your local machine.

Click [here](https://nodejs.org/en/download/) to download `Node.js` LTS version.

## 2. Fill in your Firebase app key

Please create a `.env` file on your root directory. (e.g. `./.env`) and fill in the following code. That's what the tool needs to connect to your Firebase storage.

```env
apiKey=Your Key
authDomain=Your Key
projectId=Your Key
storageBucket=Your Key
messagingSenderId=Your Key
appId=Your Key
measurementId=Your Key
```

## 3. Modify your personal configuration.

Go to `./src/config.ts` file and modify them.

```ts
export const config = {
	storageDirectory: "/dev/users", // the directory of the firebase storage. (e.g. "dev/users")
	rootDirectory: ".", // "." means the current directory. You can change it to your own directory. (e.g. "C:/Users/32604/Desktop")
	outputFolderName: "output", // the folder name of the output. (e.g. "output")
};
```

## 4. Now, let's run the tool

Now, you are good to go. Open your terminal and type the following statement to run the tool.

```bash
# Before you run the tool, you have to install the required packages first.
npm ci
# Once you install all the packages, you can run the tool now.
npm run ts-dev
```

## 5. Congrats!

Now, you can open your output folder and check the files.
