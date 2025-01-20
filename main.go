package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/jpoz/groq"
)

func getAIresponse(prompt string) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")

	client := groq.NewClient(groq.WithAPIKey(apiKey))

	chatCompletion, err := client.CreateChatCompletion(groq.CompletionCreateParams{
		Model: "llama3-8b-8192",
		Messages: []groq.Message{
			{
				Role:    "system",
				Content: "You are UI/UX designer. Your primary role is to assist the user in settings the prerequisites like the perfect color scheme, font families, hero images,etc. for designing an application or a modern website according to the prompt of the user",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		// Stream: true,
	})
	if err != nil {
		return "", err
	}

	// for delta := range chatCompletion.Stream {
	// 	fmt.Print(delta.Choices[0].Delta.Content)
	// }
	return chatCompletion.Choices[0].Message.Content, nil
}

func aiResponseHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	resp, err := getAIresponse(q)
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
	port := "8080"
	r := mux.NewRouter()
	r.HandleFunc("/ai", aiResponseHandler).Methods("GET")
	log.Printf("server starting on port: %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
