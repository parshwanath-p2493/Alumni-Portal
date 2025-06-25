package handlers

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gofiber/websocket/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Client represents a connected WebSocket client
type Client struct {
	ID     string
	Conn   *websocket.Conn
	UserID string
}

// Message represents a chat message
type Message struct {
	ID         string    `json:"id" bson:"_id,omitempty"`
	SenderID   string    `json:"senderId" bson:"senderId"`
	ReceiverID string    `json:"receiverId" bson:"receiverId"`
	Content    string    `json:"content" bson:"content"`
	Timestamp  time.Time `json:"timestamp" bson:"timestamp"`
	Read       bool      `json:"read" bson:"read"`
	Type       string    `json:"type" bson:"type"` // Added type field for different message types
}

// WebSocketManager manages WebSocket connections
type WebSocketManager struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan Message
	mutex      sync.Mutex
}

// NewWebSocketManager creates a new WebSocket manager
func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan Message),
	}
}

// Run starts the WebSocket manager
func (manager *WebSocketManager) Run() {
	log.Println("WebSocket manager started")
	for {
		select {
		case client := <-manager.register:
			manager.mutex.Lock()
			manager.clients[client.ID] = client
			manager.mutex.Unlock()
			log.Printf("Client connected: %s (User: %s)", client.ID, client.UserID)

			// Send connection confirmation
			confirmMsg := Message{
				Type:      "system",
				Content:   "Connected successfully",
				Timestamp: time.Now(),
			}
			if err := client.Conn.WriteJSON(confirmMsg); err != nil {
				log.Printf("Error sending confirmation to client %s: %v", client.ID, err)
			}

		case client := <-manager.unregister:
			manager.mutex.Lock()
			if _, ok := manager.clients[client.ID]; ok {
				delete(manager.clients, client.ID)
				client.Conn.Close()
			}
			manager.mutex.Unlock()
			log.Printf("Client disconnected: %s (User: %s)", client.ID, client.UserID)

		case message := <-manager.broadcast:
			manager.mutex.Lock()
			for _, client := range manager.clients {
				if client.UserID == message.ReceiverID || client.UserID == message.SenderID {
					err := client.Conn.WriteJSON(message)
					if err != nil {
						log.Printf("Error sending message to client %s: %v", client.ID, err)
						client.Conn.Close()
						delete(manager.clients, client.ID)
					}
				}
			}
			manager.mutex.Unlock()
		}
	}
}

// Global WebSocket manager
var WSManager = NewWebSocketManager()

// WebSocketHandler handles WebSocket connections
func WebSocketHandler(c *websocket.Conn) {
	// Get user ID from context (it's stored as string now)
	userIDInterface := c.Locals("userID")
	if userIDInterface == nil {
		log.Printf("No userID found in context")
		c.Close()
		return
	}

	userID, ok := userIDInterface.(string)
	if !ok {
		log.Printf("userID is not a string: %T", userIDInterface)
		c.Close()
		return
	}

	log.Printf("New WebSocket connection for user: %s", userID)

	// Create a new client
	client := &Client{
		ID:     primitive.NewObjectID().Hex(),
		Conn:   c,
		UserID: userID,
	}

	// Register the client
	WSManager.register <- client

	// Defer cleanup
	defer func() {
		WSManager.unregister <- client
	}()

	// Handle incoming messages
	for {
		messageType, msg, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error for user %s: %v", userID, err)
			}
			break
		}

		if messageType == websocket.TextMessage {
			var incomingMessage map[string]interface{}
			if err := json.Unmarshal(msg, &incomingMessage); err != nil {
				log.Printf("Error unmarshaling message: %v", err)
				continue
			}

			// Handle different message types
			msgType, _ := incomingMessage["type"].(string)
			log.Printf("Received message type: %s from user: %s", msgType, userID)

			switch msgType {
			case "connect":
				// Handle connection message
				log.Printf("User %s connected via WebSocket", userID)

			case "message":
				// Handle chat message
				var message Message
				if err := json.Unmarshal(msg, &message); err != nil {
					log.Printf("Error unmarshaling chat message: %v", err)
					continue
				}

				// Set message properties
				message.ID = primitive.NewObjectID().Hex()
				message.SenderID = userID
				message.Timestamp = time.Now()
				message.Read = false
				message.Type = "new_message"

				log.Printf("Broadcasting message from %s to %s", message.SenderID, message.ReceiverID)

				// Here you would typically save the message to your database
				// Example: messageService.SaveMessage(message)

				// Broadcast the message
				WSManager.broadcast <- message

			case "ping":
				// Handle ping message
				pongMsg := Message{
					Type:      "pong",
					Content:   "pong",
					Timestamp: time.Now(),
				}
				c.WriteJSON(pongMsg)

			default:
				log.Printf("Unknown message type: %s", msgType)
			}
		}
	}
}

// Helper function to send notification to specific user
func SendNotificationToUser(userID string, notification Message) {
	WSManager.mutex.Lock()
	defer WSManager.mutex.Unlock()

	for _, client := range WSManager.clients {
		if client.UserID == userID {
			err := client.Conn.WriteJSON(notification)
			if err != nil {
				log.Printf("Error sending notification to user %s: %v", userID, err)
			}
		}
	}
}
