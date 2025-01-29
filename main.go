package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/jpoz/groq"
	"github.com/rs/cors"
)

func getAIresponse(prompt string, oldQues []groq.Message) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")

	client := groq.NewClient(groq.WithAPIKey(apiKey))

	messages := []groq.Message{}
	systemMsg := groq.Message{
		Role:    "system",
		Content: "You are UI/UX designer. Your primary role is to assist the user in settings the prerequisites like the perfect color scheme, font families, hero images,etc. for designing an application or a modern website according to the prompt of the user",
	}
	newMsg := groq.Message{
		Role:    "user",
		Content: prompt,
	}

	messages = append(messages, systemMsg)
	messages = append(messages, oldQues...)
	messages = append(messages, newMsg)

	chatCompletion, err := client.CreateChatCompletion(groq.CompletionCreateParams{
		Model:    "llama3-8b-8192",
		Messages: messages,
	})
	if err != nil {
		return "", err
	}

	return chatCompletion.Choices[0].Message.Content, nil
}

func aiResponseHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	var oldQues []groq.Message
	json.NewDecoder(r.Body).Decode(&oldQues)
	resp, err := getAIresponse(q, oldQues)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(resp)
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT env var no set")
	}

	r := mux.NewRouter()
	r.HandleFunc("/ai", aiResponseHandler).Methods("POST")
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "Cookie"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)
	log.Printf("server starting on port: %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
