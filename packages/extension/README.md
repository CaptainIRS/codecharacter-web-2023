# CodeCharacter 2022 VSCode Extension

An extension for VSCode that allows players to play CodeCharacter from the comfort of their IDE.

## Prerequisites:

### Windows:

- Install WSL 2 ([link](https://docs.microsoft.com/en-us/windows/wsl/install)).
- Install Ubuntu for WSL 2 from [here](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6).
- Open VSCode and press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the command panel and enter `>remote-wsl.newWindowForDistro` and select Ubuntu in the dropdown.
- Install this extension under WSL.
- Click on the extension icon in the side panel to activate the extension.
- Open the terminal in the window and follow the instructions for Ubuntu below to set-up:

### Ubuntu:

Depending on the language you wish to use to write code in, run these commands in the terminal.

- C++: gcc/g++ (version 11 or higher):

  ```sh
  sudo apt-get update -y \
    && sudo apt-get upgrade -y \
    && sudo apt-get install build-essential software-properties-common -y \
    && sudo add-apt-repository ppa:ubuntu-toolchain-r/test -y \
    && sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1E9377A2BA9EF27F \
    && sudo apt-get update -y && sudo apt-get install gcc-11 g++-11 -y
  ```

- Python: Python 3.9 or higher:

  ```sh
  sudo apt-get update -y \
    && sudo apt-get upgrade -y \
    && sudo apt-get install python3.9
  ```

- Java: Java 17:

  ```sh
  sudo apt-get update -y \
    && sudo apt-get upgrade -y \
    && sudo apt-get install openjdk-17-jdk
  ```

### Mac:

- C++: gcc/g++ (version 11 or higher): `brew install gcc`
- Python: Python 3.9 or higher: `brew install python3`
- Java: Java 17: `brew install openjdk`

## Usage

![](https://i.imgur.com/tGrnF1G.png)

![](https://i.imgur.com/mMMrjX5.png)

![](https://i.imgur.com/hQZ1lZX.png)

![](https://i.imgur.com/0gCJiBI.png)

![](https://i.imgur.com/Mp7cXYI.png)

![](https://i.imgur.com/tzEzxu3.png)

![](https://i.imgur.com/RemOFbW.png)
