import time
import sys
from selenium import webdriver

def test_hotspot_click():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1200,800')
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get('http://localhost:8080')
        time.sleep(2)
        
        # 1. Switch to third party risk tab
        driver.execute_script("window.switchTab('manager-thirdparty');")
        time.sleep(1)
        
        # 2. Click on Concentration Risk sub-tab
        driver.execute_script("document.getElementById('tab-tpr-concentration').click();")
        time.sleep(1)
        
        # Get map title
        print("Initial Hotspot Title:", driver.execute_script("return document.querySelector('#view-manager-thirdparty h3[style*=\"border-bottom: 1px dashed\"]').innerText;"))
        
        # Locate all rows in the hotspot table
        rows = driver.find_elements("css selector", ".hotspot-row")
        print(f"Found {len(rows)} concentration rows in the table.")
        
        # Find Cloudflare row and click it
        clicked = False
        for r in rows:
            name = r.get_attribute("data-name")
            print(f"Row name: {name}")
            if name == "Cloudflare":
                driver.execute_script("arguments[0].click();", r)
                print("Clicked Cloudflare row!")
                clicked = True
                break
                
        if not clicked:
            print("ERROR: Cloudflare row not found in the hotspots table.")
            
        time.sleep(1)
        print("Updated Hotspot Title:", driver.execute_script("return document.querySelector('#view-manager-thirdparty h3[style*=\"border-bottom: 1px dashed\"]').innerText;"))
        
    finally:
        driver.quit()

if __name__ == '__main__':
    test_hotspot_click()
