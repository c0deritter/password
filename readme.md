# Password.js
Password.js is a lightweight CLI password managment tool based on OpenPGP written in JavaScript.

## Usage
```
npm install --global git+https://gitlab.coderitter.io/lean-tools/password-manager.git
mkdir boards
cd boards
# Optionally create a new git repo to versioning and backup your boards to your private remote git server like gitlab
git init
password
```
## Technical Details

Password.js organize your keys/passwords in a JSON file container so called board. Every board has a name, an encrypted private key, a password, a public key and entries. The encryption chain is this, the password encrypts the private key and the private key, in turn, encrypts the entries.
If you share your board access with an other board, you decrypt your private board key, encrypt it again with the public key of the other board you want to share the access with and add your again encrypted key as entry from the other board.
An entry have an id, an entry name, a login name, a password, a description, a link to the login form and tags. Both the password and description are encrypted. The encryption library is OpenPGP.js.