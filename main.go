package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Msg struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Body struct {
	Model    string `json:"model"`
	Messages []Msg  `json:"messages"`
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	apiKey := "Bearer " + os.Getenv("APIKEY")
	baseURL := "https://api.groq.com/openai/v1/chat/completions"

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	x := Body{
		Model: "llama-3.3-70b-versatile",
		Messages: []Msg{
			{
				Role:    "user",
				Content: "What day is today",
			},
		},
	}

	jsonBody, err := json.Marshal(x)
	if err != nil {
		fmt.Printf("Error parsing JSON: %v", err)
		return
	}

	req, err := http.NewRequestWithContext(ctx, "POST", baseURL, bytes.NewBuffer(jsonBody))

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", apiKey)

	client := http.DefaultClient
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error in sending req: %v", err)
		return
	}
	defer resp.Body.Close()

	res, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error while reading resp: %v", err)
		return
	}
	var d ChatCompletion
	err = json.Unmarshal(res, &d)
	if err != nil {
		fmt.Printf("Error while marshalling resp: %v", err)
		return
	}
	fmt.Println(d.Choices[0].Message.Content)
	return
}
