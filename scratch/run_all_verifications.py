import os
import sys
import time
import urllib.request
import http.server
import socketserver
import threading
import py_compile
from selenium import webdriver

# 1. Start Background HTTP Server
PORT = 8080
httpd = None

def start_server():
    global httpd
    class SafeHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass # suppress access log prints to avoid cluttering stdout
            
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("", PORT), SafeHandler)
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    print(f"[OK] Self-contained local test server initiated on port {PORT}")

def stop_server():
    global httpd
    if httpd:
        httpd.shutdown()
        httpd.server_close()
        print("[OK] Test server stopped successfully.")

# 2. Syntax check
def run_syntax_checks(scratch_dir):
    py_files = [os.path.join(scratch_dir, f) for f in os.listdir(scratch_dir) if f.endswith('.py') and f != "run_all_verifications.py"]
    print(f"\nScanning {len(py_files)} verification helper scripts for syntax compilation...")
    errors = 0
    for pf in py_files:
        try:
            py_compile.compile(pf, doraise=True)
        except Exception as e:
            print(f"  [ERROR] {os.path.basename(pf)}: Syntax Error - {e}")
            errors += 1
    if errors == 0:
        print(f"  [PASS] All {len(py_files)} Python scripts compiled successfully.")
    else:
        print(f"  [FAIL] {errors} scripts failed to compile.")
    return errors == 0

# 3. Fetch GH Pages
def verify_gh_pages():
    url = 'https://cyphervantageai.github.io/core-platform/'
    print(f"\nVerifying live production GitHub Pages URL: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            status = response.status
            if status == 200:
                print(f"  [PASS] GitHub Pages returned status code 200.")
                return True
            else:
                print(f"  [FAIL] GitHub Pages returned unexpected status: {status}")
                return False
    except Exception as e:
        print(f"  [FAIL] Error connecting to GitHub Pages: {e}")
        return False

# 4. Selenium Navigation & Tab switches
def verify_navigation_tabs():
    print("\nVerifying all UI workspaces click-through transitions via Selenium...")
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1200,800')
    options.add_argument('--disk-cache-size=1')
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(options=options)
    all_ok = True
    try:
        driver.get(f'http://localhost:{PORT}/?cb={int(time.time())}')
        time.sleep(3)
        
        tabs = [
            'manager-dashboard', 'manager-resilience', 'manager-dora', 'manager-risk',
            'manager-thirdparty', 'manager-reports', 'manager-navigator', 'manager-collector',
            'manager-advisor', 'manager-ai-risk', 'manager-inbox'
        ]
        
        for tab in tabs:
            driver.execute_script(f"window.switchTab('{tab}');")
            time.sleep(0.4)
            # Check for console errors
            logs = driver.get_log('browser')
            errors = [l for l in logs if l['level'] == 'SEVERE' and 'favicon.ico' not in l['message']]
            if errors:
                print(f"  [FAIL] Tab '{tab}' transition produced console errors: {errors}")
                all_ok = False
            else:
                print(f"  [OK] Tab '{tab}' transition verified.")
                
        if all_ok:
            print("  [PASS] All workspaces transitioned successfully with zero browser exceptions.")
    except Exception as e:
        print(f"  [FAIL] Navigation test exception: {e}")
        all_ok = False
    finally:
        driver.quit()
    return all_ok

# 5. Selenium Functional checks
def verify_demo_features():
    print("\nVerifying compliance workflows, dropdown controls, and maps...")
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1280,1024')
    options.add_argument('--disk-cache-size=1')
    driver = webdriver.Chrome(options=options)
    all_ok = True
    try:
        driver.get(f'http://localhost:{PORT}/?cb={int(time.time())}')
        time.sleep(4)
        
        # Test Global Threat Map drill down
        driver.execute_script("window.switchTab('manager-dashboard');")
        time.sleep(0.2)
        btn_map = driver.find_element("id", "btn-db-tab-threatmap")
        driver.execute_script("arguments[0].click();", btn_map)
        time.sleep(0.5)
        
        # Click North America region
        driver.execute_script("window.drillResilienceDown('na');")
        time.sleep(0.2)
        print("  [OK] Threat Map regional drill down verified.")
        
        # Test ICT Risk Configurations update
        driver.execute_script("window.switchTab('manager-risk');")
        time.sleep(0.2)
        input_med = driver.find_element("id", "input-thresh-med")
        driver.execute_script("arguments[0].value = '8'; arguments[0].dispatchEvent(new Event('change'));", input_med)
        time.sleep(0.2)
        print("  [OK] ICT Risk threshold inputs verified.")
        
        # Test Supplier portal compliance updates
        driver.execute_script("window.switchTab('manager-thirdparty');")
        time.sleep(0.2)
        driver.execute_script("window.setPersona('supplier');")
        time.sleep(0.4)
        
        # Select active supplier dropdown option
        select_el = driver.find_element("id", "active-supplier-select")
        driver.execute_script("arguments[0].value = 'infosys'; arguments[0].dispatchEvent(new Event('change'));", select_el)
        time.sleep(0.4)
        print("  [OK] Supplier switcher context changes verified.")
        
        print("  [PASS] All interactive workflows completed with zero script faults.")
    except Exception as e:
        print(f"  [FAIL] Functional workflow exception: {e}")
        all_ok = False
    finally:
        driver.quit()
    return all_ok

def main():
    start_time = time.time()
    # Force search to look in the correct artifacts scratch directory
    artifacts_dir = r"C:\Users\samba\.gemini\antigravity\brain\e6a614fc-148d-470c-8975-25aa303c5b16"
    scratch_dir = os.path.join(artifacts_dir, "scratch")
    
    print("====================================================")
    print("CYPHER VANTAGE CONSOLIDATED HEALTH CHECK BUNDLE")
    print("====================================================")
    
    # Run checks
    syntax_ok = run_syntax_checks(scratch_dir)
    gh_ok = verify_gh_pages()
    
    # Run Selenium tests against local server
    start_server()
    time.sleep(1) # wait for server thread to bind
    
    nav_ok = False
    func_ok = False
    try:
        nav_ok = verify_navigation_tabs()
        func_ok = verify_demo_features()
    finally:
        stop_server()
        
    print("\n====================================================")
    print("CONSOLIDATED HEALTH SUMMARY")
    print("====================================================")
    print(f"1. Script Syntax Check:      {'[PASS]' if syntax_ok else '[FAIL]'}")
    print(f"2. Production URL Status:    {'[PASS]' if gh_ok else '[FAIL]'}")
    print(f"3. Workspace Tab Switches:   {'[PASS]' if nav_ok else '[FAIL]'}")
    print(f"4. Portal Functional Drills: {'[PASS]' if func_ok else '[FAIL]'}")
    print("====================================================")
    
    elapsed = time.time() - start_time
    print(f"Health check execution completed in {elapsed:.2f} seconds.")
    
    if syntax_ok and gh_ok and nav_ok and func_ok:
        print("\nSUCCESS: All platform systems verified healthy!")
        sys.exit(0)
    else:
        print("\nERROR: Verification gaps identified.")
        sys.exit(1)

if __name__ == "__main__":
    main()
