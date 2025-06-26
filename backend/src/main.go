package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type Person struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Expertise string `json:"expertise"`
}

type State struct {
	Name   string   `json:"name"`
	People []Person `json:"people"`
}

type Mappings struct {
	States []State `json:"states"`
}

var db *sql.DB

func main() {
	var err error
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName)
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	createTables()

	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/mappings", getMappings)
	router.POST("/mappings", postMappings)
	router.Run(":8080")
}

func createTables() {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS states (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL UNIQUE
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS people (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			expertise VARCHAR(255) NOT NULL
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS state_people (
			state_id INT,
			people_id INT,
			FOREIGN KEY (state_id) REFERENCES states(id),
			FOREIGN KEY (people_id) REFERENCES people(id),
			PRIMARY KEY (state_id, people_id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func getMappings(c *gin.Context) {
	rows, err := db.Query(`
		SELECT s.name, p.id, p.name, p.expertise
		FROM states s
		JOIN state_people sp ON s.id = sp.state_id
		JOIN people p ON sp.people_id = p.id
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	statesMap := make(map[string][]Person)
	for rows.Next() {
		var stateName, personName, expertise string
		var personID int
		if err := rows.Scan(&stateName, &personID, &personName, &expertise); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		statesMap[stateName] = append(statesMap[stateName], Person{ID: personID, Name: personName, Expertise: expertise})
	}

	var states []State
	for name, people := range statesMap {
		states = append(states, State{Name: name, People: people})
	}

	c.JSON(http.StatusOK, Mappings{States: states})
}

func postMappings(c *gin.Context) {
	var newState State
	if err := c.ShouldBindJSON(&newState); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var stateID int
	err = tx.QueryRow("SELECT id FROM states WHERE name = ?", newState.Name).Scan(&stateID)
	if err == sql.ErrNoRows {
		res, err := tx.Exec("INSERT INTO states (name) VALUES (?)", newState.Name)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		stateID = int(id)
	} else if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, person := range newState.People {
		res, err := tx.Exec("INSERT INTO people (id, name, expertise) VALUES (?, ?, ?)", person.ID, person.Name, person.Expertise)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		personID, _ := res.LastInsertId()

		_, err = tx.Exec("INSERT INTO state_people (state_id, people_id) VALUES (?, ?)", stateID, personID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newState)
}
