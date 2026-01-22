#!/usr/bin/env python3
"""
Backend API Testing for Glass Tasks TODO App
Tests all CRUD operations and API endpoints
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class TodoAPITester:
    def __init__(self, base_url="https://glass-task-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_todos = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def test_api_health(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
            return False

    def test_get_categories(self):
        """Test categories endpoint"""
        try:
            response = requests.get(f"{self.api_url}/categories", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                categories = data.get('categories', [])
                expected_categories = ["general", "work", "personal", "shopping", "health", "learning"]
                has_expected = all(cat in categories for cat in expected_categories)
                details += f", Categories count: {len(categories)}, Has expected: {has_expected}"
                success = success and has_expected
                
            self.log_test("Get Categories", success, details)
            return success
        except Exception as e:
            self.log_test("Get Categories", False, f"Error: {str(e)}")
            return False

    def test_get_todos_empty(self):
        """Test getting todos when empty"""
        try:
            response = requests.get(f"{self.api_url}/todos", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Todos count: {len(data)}"
                
            self.log_test("Get Todos (Empty)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Todos (Empty)", False, f"Error: {str(e)}")
            return False

    def test_create_todo(self):
        """Test creating a new todo"""
        try:
            todo_data = {
                "title": "Test Todo",
                "description": "This is a test todo item",
                "category": "work",
                "priority": "high",
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            }
            
            response = requests.post(
                f"{self.api_url}/todos", 
                json=todo_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                todo_id = data.get('id')
                if todo_id:
                    self.created_todos.append(todo_id)
                    details += f", Created ID: {todo_id}, Title: {data.get('title')}"
                else:
                    success = False
                    details += ", Missing ID in response"
                    
            self.log_test("Create Todo", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Todo", False, f"Error: {str(e)}")
            return False, None

    def test_get_todos_with_data(self):
        """Test getting todos after creating some"""
        try:
            response = requests.get(f"{self.api_url}/todos", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Todos count: {len(data)}"
                success = len(data) > 0
                
            self.log_test("Get Todos (With Data)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Todos (With Data)", False, f"Error: {str(e)}")
            return False

    def test_update_todo(self, todo_id):
        """Test updating a todo"""
        try:
            update_data = {
                "title": "Updated Test Todo",
                "description": "This todo has been updated",
                "priority": "medium",
                "completed": True
            }
            
            response = requests.put(
                f"{self.api_url}/todos/{todo_id}",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Updated title: {data.get('title')}, Completed: {data.get('completed')}"
                
            self.log_test("Update Todo", success, details)
            return success
        except Exception as e:
            self.log_test("Update Todo", False, f"Error: {str(e)}")
            return False

    def test_update_nonexistent_todo(self):
        """Test updating a non-existent todo"""
        try:
            fake_id = str(uuid.uuid4())
            update_data = {"title": "Should not work"}
            
            response = requests.put(
                f"{self.api_url}/todos/{fake_id}",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 404
            details = f"Status: {response.status_code} (Expected 404)"
            
            self.log_test("Update Non-existent Todo", success, details)
            return success
        except Exception as e:
            self.log_test("Update Non-existent Todo", False, f"Error: {str(e)}")
            return False

    def test_delete_todo(self, todo_id):
        """Test deleting a todo"""
        try:
            response = requests.delete(f"{self.api_url}/todos/{todo_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
                
            self.log_test("Delete Todo", success, details)
            return success
        except Exception as e:
            self.log_test("Delete Todo", False, f"Error: {str(e)}")
            return False

    def test_delete_nonexistent_todo(self):
        """Test deleting a non-existent todo"""
        try:
            fake_id = str(uuid.uuid4())
            response = requests.delete(f"{self.api_url}/todos/{fake_id}", timeout=10)
            success = response.status_code == 404
            details = f"Status: {response.status_code} (Expected 404)"
            
            self.log_test("Delete Non-existent Todo", success, details)
            return success
        except Exception as e:
            self.log_test("Delete Non-existent Todo", False, f"Error: {str(e)}")
            return False

    def test_create_multiple_todos(self):
        """Test creating multiple todos with different data"""
        todos_to_create = [
            {
                "title": "Personal Task",
                "description": "Personal todo item",
                "category": "personal",
                "priority": "low"
            },
            {
                "title": "Shopping List",
                "description": "Buy groceries",
                "category": "shopping",
                "priority": "medium",
                "due_date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
            },
            {
                "title": "Health Checkup",
                "description": "Annual health checkup",
                "category": "health",
                "priority": "high",
                "due_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            }
        ]
        
        created_count = 0
        for i, todo_data in enumerate(todos_to_create):
            try:
                response = requests.post(
                    f"{self.api_url}/todos",
                    json=todo_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    todo_id = data.get('id')
                    if todo_id:
                        self.created_todos.append(todo_id)
                        created_count += 1
                        
            except Exception as e:
                print(f"Error creating todo {i+1}: {str(e)}")
        
        success = created_count == len(todos_to_create)
        details = f"Created {created_count}/{len(todos_to_create)} todos"
        self.log_test("Create Multiple Todos", success, details)
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests for Glass Tasks TODO App")
        print("=" * 60)
        
        # Test API health first
        if not self.test_api_health():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test categories
        self.test_get_categories()
        
        # Test empty todos
        self.test_get_todos_empty()
        
        # Test creating a todo
        success, created_todo = self.test_create_todo()
        todo_id = created_todo.get('id') if created_todo else None
        
        # Test getting todos with data
        if success:
            self.test_get_todos_with_data()
        
        # Test updating todo
        if todo_id:
            self.test_update_todo(todo_id)
        
        # Test error cases
        self.test_update_nonexistent_todo()
        self.test_delete_nonexistent_todo()
        
        # Test creating multiple todos
        self.test_create_multiple_todos()
        
        # Test deleting todo
        if todo_id:
            self.test_delete_todo(todo_id)
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
        
        return self.tests_passed == self.tests_run

    def cleanup(self):
        """Clean up created todos"""
        print(f"\n🧹 Cleaning up {len(self.created_todos)} created todos...")
        for todo_id in self.created_todos:
            try:
                requests.delete(f"{self.api_url}/todos/{todo_id}", timeout=5)
            except:
                pass

def main():
    tester = TodoAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1
    finally:
        tester.cleanup()

if __name__ == "__main__":
    sys.exit(main())