#!/usr/bin/env python3
"""
Morphic Auto-Publisher
Automated content distribution across all platforms
Built for Quintapoo Dominator / Dopa Tech
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class MorphicPublisher:
    def __init__(self, headless=False):
        """Initialize browser with saved credentials"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--user-data-dir=/home/ubuntu/.config/google-chrome')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 20)
    
    def publish_to_substack(self, title, content, subtitle=""):
        """Publish article to Substack"""
        print("📝 Publishing to Substack...")
        try:
            self.driver.get("https://substack.com/publish/post/new")
            time.sleep(3)
            
            # Title
            title_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='Title']")))
            title_field.send_keys(title)
            
            # Subtitle (if exists)
            if subtitle:
                subtitle_field = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Subtitle']")
                subtitle_field.send_keys(subtitle)
            
            # Content
            content_field = self.driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true']")
            content_field.send_keys(content)
            
            # Publish
            time.sleep(2)
            publish_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
            publish_btn.click()
            time.sleep(2)
            
            send_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Send to everyone now')]")
            send_btn.click()
            
            print("✅ Substack: Published successfully")
            return True
        except Exception as e:
            print(f"❌ Substack: Failed - {str(e)}")
            return False
    
    def publish_to_medium(self, title, content):
        """Publish article to Medium"""
        print("📝 Publishing to Medium...")
        try:
            self.driver.get("https://medium.com/new-story")
            time.sleep(3)
            
            # Title
            title_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1[contenteditable='true']")))
            title_field.send_keys(title)
            
            # Content
            content_field = self.driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true'][data-contents='true']")
            content_field.send_keys(content)
            
            # Publish
            time.sleep(2)
            publish_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Publish')]")
            publish_btn.click()
            time.sleep(2)
            
            publish_now_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Publish now')]")
            publish_now_btn.click()
            
            print("✅ Medium: Published successfully")
            return True
        except Exception as e:
            print(f"❌ Medium: Failed - {str(e)}")
            return False
    
    def publish_to_devto(self, title, content, tags=[]):
        """Publish article to Dev.to"""
        print("📝 Publishing to Dev.to...")
        try:
            self.driver.get("https://dev.to/new")
            time.sleep(3)
            
            # Title
            title_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='title']")))
            title_field.send_keys(title)
            
            # Tags
            if tags:
                tags_field = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='tags']")
                tags_field.send_keys(", ".join(tags))
            
            # Content
            content_field = self.driver.find_element(By.CSS_SELECTOR, "textarea")
            content_field.send_keys(content)
            
            # Publish
            time.sleep(2)
            publish_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Publish')]")
            publish_btn.click()
            
            print("✅ Dev.to: Published successfully")
            return True
        except Exception as e:
            print(f"❌ Dev.to: Failed - {str(e)}")
            return False
    
    def publish_to_hashnode(self, title, content):
        """Publish article to Hashnode"""
        print("📝 Publishing to Hashnode...")
        try:
            self.driver.get("https://hashnode.com/draft/new")
            time.sleep(3)
            
            # Title
            title_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='title']")))
            title_field.send_keys(title)
            
            # Content
            content_field = self.driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true']")
            content_field.send_keys(content)
            
            # Publish
            time.sleep(2)
            publish_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Publish')]")
            publish_btn.click()
            
            print("✅ Hashnode: Published successfully")
            return True
        except Exception as e:
            print(f"❌ Hashnode: Failed - {str(e)}")
            return False
    
    def publish_to_linkedin(self, content):
        """Publish post to LinkedIn"""
        print("📝 Publishing to LinkedIn...")
        try:
            self.driver.get("https://www.linkedin.com/")
            time.sleep(3)
            
            # Start post
            start_post_btn = self.wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Start a post')]")))
            start_post_btn.click()
            time.sleep(2)
            
            # Content
            content_field = self.driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true']")
            content_field.send_keys(content)
            
            # Post
            time.sleep(2)
            post_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Post')]")
            post_btn.click()
            
            print("✅ LinkedIn: Published successfully")
            return True
        except Exception as e:
            print(f"❌ LinkedIn: Failed - {str(e)}")
            return False
    
    def publish_to_twitter(self, content):
        """Publish tweet to X/Twitter"""
        print("📝 Publishing to X/Twitter...")
        try:
            self.driver.get("https://x.com/compose/tweet")
            time.sleep(3)
            
            # Content
            content_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[contenteditable='true']")))
            content_field.send_keys(content)
            
            # Post
            time.sleep(2)
            post_btn = self.driver.find_element(By.XPATH, "//button[@data-testid='tweetButton']")
            post_btn.click()
            
            print("✅ X/Twitter: Published successfully")
            return True
        except Exception as e:
            print(f"❌ X/Twitter: Failed - {str(e)}")
            return False
    
    def close(self):
        """Close browser"""
        self.driver.quit()

# Example usage
if __name__ == "__main__":
    publisher = MorphicPublisher(headless=False)
    
    # Example: Publish to all platforms
    title = "Test Article"
    content = "This is a test article content."
    
    # Uncomment to test
    # publisher.publish_to_substack(title, content)
    # publisher.publish_to_medium(title, content)
    # publisher.publish_to_devto(title, content, tags=["test", "automation"])
    # publisher.publish_to_hashnode(title, content)
    # publisher.publish_to_linkedin(content)
    # publisher.publish_to_twitter(content[:280])
    
    publisher.close()
