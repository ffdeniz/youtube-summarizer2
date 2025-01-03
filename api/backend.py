from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/backend', methods=['GET'])
def backend():
    return jsonify(message="hello world")

if __name__ == '__main__':
    app.run(port=5555, debug=True)