import pyrebase

config = {
    "apiKey": "apiKey",
    "authDomain": "authDomain",
    "databaseURL": "https://databaseName.firebaseio.com",
    "storageBucket": "storageBucket",
}

firebase = pyrebase.initialize_app(config)
storage = firebase.storage()


test = storage.child("/dev/users/").list_files()

print(test)


# if __name__ == "__main__":
