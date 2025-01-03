from flask import Flask, jsonify
from utils.test import hello_module

app = Flask(__name__)

@app.route('/api/backend', methods=['GET'])
def backend():
    return jsonify(message=hello_module())

if __name__ == '__main__':
    app.run(port=5555, debug=True)