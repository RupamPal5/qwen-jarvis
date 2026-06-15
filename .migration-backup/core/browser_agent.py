from playwright.sync_api import sync_playwright
import time

def browse(task):
    """Automates browser tasks like a human."""
    print(f"🌐 Executing browser task: {task}")
    
    with sync_playwright() as p:
        # Launch browser (headless=False so you can watch it work)
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        if "youtube" in task.lower():
            query = task.replace("search youtube for", "").replace("youtube", "").strip()
            print(f"🔍 Searching YouTube for: {query}")
            page.goto("https://www.youtube.com")
            page.fill('input[name="search_query"]', query)
            page.keyboard.press("Enter")
            time.sleep(3)
            
        elif "google" in task.lower() or "search" in task.lower():
            query = task.replace("search", "").replace("google", "").strip()
            print(f"🔍 Searching Google for: {query}")
            page.goto("https://www.google.com")
            page.fill('textarea[name="q"]', query)
            page.keyboard.press("Enter")
            time.sleep(3)
            
        else:
            print(f"🌐 Navigating to: {task}")
            page.goto(task if task.startswith("http") else f"https://{task}")
            time.sleep(2)
            
        print("✅ Browser task completed.")
        browser.close()

if __name__ == "__main__":
    print("🔒 JARVIS BROWSER AGENT ONLINE")
    test_task = input("Enter a task (e.g., 'search youtube for linux tutorials'): ")
    browse(test_task)
