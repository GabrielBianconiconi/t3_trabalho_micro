# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import Adafruit_DHT
import socket

# Configurações do sensor
DHT_SENSOR = Adafruit_DHT.DHT11
DHT_PIN = 4  # Defina o pino ao qual o sensor está conectado no Raspberry Pi

app = Flask(__name__)
CORS(app)
def get_ip():
    """Função para obter o IP do Raspberry Pi na rede local."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Conecta-se a um endereço sem realmente enviar dados para pegar o IP
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception as e:
        print("Erro ao obter o IP:", e)
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

@app.route('/sensor-data', methods=['GET'])
def get_sensor_data():
    humidity, temperature = Adafruit_DHT.read(DHT_SENSOR, DHT_PIN)
    if humidity is not None and temperature is not None:
        data = {
            "temperature": temperature,
            "humidity": humidity
        }
        return jsonify(data)
    else:
        return jsonify({"error": "Falha na leitura do sensor"}), 500

if __name__ == '__main__':
    ip = get_ip()
    print(f"Servidor rodando em http://{ip}:5000")
    app.run(host=ip, port=5000)
