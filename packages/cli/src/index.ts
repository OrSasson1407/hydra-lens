import { chromium } from "playwright";
import { detectMismatches } from "@hydra-lens/core";

async function runScan(url: string) {
    console.log(`?? HydraLens Headless Scanner starting...`);
    console.log(`?? Target URL: ${url}`);
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // Fetch raw server HTML
        const response = await page.request.get(url);
        const serverHTML = await response.text();
        
        // Load the page fully for CSR
        await page.goto(url, { waitUntil: "networkidle" });
        
        // Pass serverHTML to browser context and execute core logic
        const mismatches = await page.evaluate(({ html, coreLogicStr }) => {
            // Reconstruct the core logic function inside the browser context
            const detectFunc = new Function("serverHTML", "clientDoc", coreLogicStr + "; return detectMismatches(serverHTML, clientDoc);");
            return detectFunc(html, document);
        }, { 
            html: serverHTML, 
            // In a real build, we'd inject the bundled @hydra-lens/core string here.
            coreLogicStr: detectMismatches.toString() 
        });

        console.log(`\n?? Scan Complete!`);
        console.log(`Found ${mismatches.length} mismatches.`);
        
        const criticals = mismatches.filter((m: any) => m.severity === 'critical' || m.severity === 'security');
        if (criticals.length > 0) {
            console.error(`? FAILED: Found ${criticals.length} Critical/Security issues!`);
            process.exit(1); // Fail the CI/CD pipeline
        } else {
            console.log(`? PASSED: No critical issues found.`);
            process.exit(0);
        }
    } catch (e) {
        console.error("Scan failed:", e);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

const target = process.argv[2] || "http://localhost:3000";
runScan(target);
