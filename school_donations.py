from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)

# Use your own Heroku MONGO_URI, DBS_NAME, COLLECTION_NAME to access the Mongo DB
MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
MONGO_URI = ''
DBS_NAME = ''
COLLECTION_NAME = ''
FIELDS = {'funding_status': True,
          'school_state': True,
          'resource_type': True,
          'poverty_level': True,
          'date_posted': True,
          'total_donations': True,
          '_id': False,
          }


@app.route("/")
def index():
    return render_template("indexOK.html")


@app.route("/donorsUS/projects")
def donor_projects():
    connection = MongoClient(MONGO_URI)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS, limit=10000)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects)
    connection.close()
    return json_projects


if __name__ == "__main__":
    app.run(debug=True)
