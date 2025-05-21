from flask import Flask, request, render_template, send_from_directory
import openai
import os
import requests

app = Flask(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

def ask_ellie(user_input):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": (
                "You are Ellie, a friendly and patient English tutor.\n"
                "Your goal is to help beginner learners practice English through spoken conversation.\n"
                "Always use:\n"
                "- Slow, clear, and simple English\n"
                "- Short and natural sentences (no more than 12 words)\n"
                "- Frequently used, everyday expressions\n"
                "- Encouraging and warm tone\n"
                "If the user says something unclear or complex, rephrase it simply and give examples.\n"
                "Always include a follow-up suggestion the user can repeat aloud."
            )},
            {"role": "user", "content": user_input}
        ],
        temperature=0.7,
        max_tokens=100
    )
    return response['choices'][0]['message']['content']

def synthesize_speech(text):
    audio_path = "static/ellie_response.mp3"
    response = openai.audio.speech.create(
        model="tts-1",
        voice="shimmer",
        input=text
    )
    with open(audio_path, "wb") as f:
        f.write(response.content)
    return audio_path

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        user_input = request.form["user_input"]
        ellie_response = ask_ellie(user_input)
        audio_file = synthesize_speech(ellie_response)
        return render_template("index.html", response=ellie_response, audio_file=audio_file)

    return render_template("index.html", response=None, audio_file=None)

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

if __name__ == "__main__":
    app.run(debug=True)
