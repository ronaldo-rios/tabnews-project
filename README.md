# tabnews-clone

Creation and study project development of tabnews clone Filipe Deschamps from https://curso.dev/

## Prepare environment to run the project

### Install nvm

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash`

`nvm install`

### Install dependencies

`npm install`

### Run application

`npm run dev`

### Create and Run tests

`npm run test`

### Create and Run Migrations

`migrations:create migration-name`

`migrations:up`

### Utils commands to manage dependencies

- Check outdated dependencies comparing with current version, wanted version and latest version:

  `npm outdated`

- Check vulnerabilities in dependencies:

`npm audit`

- Compare outdated dependencies with latest version and update package.json:

  `npx npm-check-updates -i`
