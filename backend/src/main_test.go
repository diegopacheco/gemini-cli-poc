
package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	var err error
	dbUser := "user"
	dbPassword := "password"
	dbName := "testdb"
	dbHost := "127.0.0.1"

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName)
	for i := 0; i < 5; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				break
			}
		}
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}

	createTables()
	code := m.Run()
	dropTables()
	db.Close()
	os.Exit(code)
}

func dropTables() {
	db.Exec("DROP TABLE IF EXISTS state_people")
	db.Exec("DROP TABLE IF EXISTS people")
	db.Exec("DROP TABLE IF EXISTS states")
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/mappings", getMappings)
	router.POST("/mappings", postMappings)
	return router
}

func TestGetMappings(t *testing.T) {
	router := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/mappings", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response Mappings
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Empty(t, response.States)
}

func TestPostMappings(t *testing.T) {
	router := setupRouter()

	newState := State{
		Name: "TX",
		People: []Person{
			{ID: 7, Name: "Developer D", Expertise: "Backend"},
			{ID: 8, Name: "Developer E", Expertise: "Frontend"},
			{ID: 9, Name: "Developer F", Expertise: "DevOps"},
		},
	}

	jsonValue, _ := json.Marshal(newState)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/mappings", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response State
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, newState.Name, response.Name)
	assert.Equal(t, len(newState.People), len(response.People))

	// Verify data is in the database
	var stateName string
	err := db.QueryRow("SELECT name FROM states WHERE name = 'TX'").Scan(&stateName)
	assert.NoError(t, err)
	assert.Equal(t, "TX", stateName)
}
