unManage.ai

commands are for linux(dabian based with apt) 

#1 install python 3.13

*simple installation with a third party personal package manager(ppa):
sudo apt update

sudo apt install software-properties-common

sudo add-apt-repository ppa:deadsnakes/ppa

sudo apt update

sudo apt install python3.13

#2 install pipenv 

sudo apt install pipenv

#3 install docker desktop

#4 in the project root directory do pipenv install

#4 to activate the env use pipenv shell in project root directory

#5 create a .env file in the project root and define the following env variables 

POSTGRES_USER

POSTGRES_PASSWORD

POSTGRES_DB

POSTGRES_HOST

POSTGRES_PORT

POSTGRES_READY

DJANGO_SECRET_KEY


#6 to build the docker image and start the containers run

docker compose up

#7 
the project is not a docker container yet to run the project 
python manage.py migrate 
python mange.py runserver
