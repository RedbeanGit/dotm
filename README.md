
# DOTM

DO Time Manager is a script to save time spent on different projects


## Run

First clone this repo:

```bash
$ git clone git@github.com:RedbeanGit/dotm.git
$ cd dotm
```

Then run it with Nodejs:

```bash
$ node dotm.js ...args
```

#### Add new entry

Command description (`project` and `description` are optional):

```bash
$ node dotm.js <time> [project] [description]
```

Example:

```bash
$ node dotm.js December 12 2h mongodb
```

#### Get entry

Command description (`project` is optional):

```bash
$ node dotm.js GET <time> [project]
```

Example:

```bash
$ node dotm.js GET December 12 2h mongodb
```

#### Get entries with a specific hashtag in its description

Command description (`project` is optional):

```bash
$ node dotm.js GET-HASH <hashtag> [project]
```

Example:

```bash
$ node dotm.js GET-HASH #myproject mongodb
```

#### List entries for each day

Command description (`project` is optional):

```bash
$ node dotm.js REPORT PERDAY [project]
```

Example:

```bash
$ node dotm.js REPORT PERDAY mongodb
```
## Environment Variables

Local environment variables can be written in a `.env` file.

**`DOTM_USER`**

The username to use to connect to MongoDB.

**`DOTM_PASSWORD`**

The password to use to connect to MongoDB.

**`DOTM_HOST`**

The MongoDB server's address.

**`DOTM_PORT`**

The port on which MongoDB server is running.

**`DOTM_DB`**

The database to store entries.