const Stripe = require("stripe");
const fs = require("fs");

const stripeKey = process.env.STRIPE_SECRET_KEY || process.argv[2];

if (!stripeKey) {
  console.error("Error: Please provide your Stripe Secret Key.");
  console.error("Usage: node export_purchases.js <STRIPE_SECRET_KEY>");
  console.error("Or set the STRIPE_SECRET_KEY environment variable first.");
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

async function exportPurchases() {
  console.log("Connecting to Stripe and fetching completed sessions...");
  try {
    let hasMore = true;
    let startingAfter = undefined;
    const allSessions = [];

    while (hasMore) {
      const response = await stripe.checkout.sessions.list({
        limit: 100,
        status: "complete",
        starting_after: startingAfter
      });

      allSessions.push(...response.data);
      hasMore = response.has_more;
      if (response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    const paidSessions = allSessions.filter(s => s.payment_status === "paid");
    console.log(`Retrieved ${allSessions.length} total completed sessions, found ${paidSessions.length} paid transactions.`);
    
    let markdown = "# Stripe Purchase History (Exported)\n\n";
    markdown += "| Date | Customer Name | Customer Email | Product ID | Amount | Status | Session ID |\n";
    markdown += "| --- | --- | --- | --- | --- | --- | --- |\n";

    let csv = "Date,Customer Name,Customer Email,Product ID,Amount,Currency,Status,Session ID\n";

    for (const session of paidSessions) {
      const date = new Date(session.created * 1000).toISOString().split('T')[0];
      const name = session.customer_details?.name || "Guest";
      const email = session.customer_details?.email || "N/A";
      const productId = session.metadata?.productId || "N/A";
      const amount = (session.amount_total / 100).toFixed(2);
      const currency = session.currency.toUpperCase();
      const status = session.status;
      
      markdown += `| ${date} | ${name} | ${email} | ${productId} | $${amount} ${currency} | ${status} | \`${session.id}\` |\n`;
      csv += `"${date}","${name.replace(/"/g, '""')}","${email}","${productId}",${amount},"${currency}","${status}","${session.id}"\n`;
    }

    fs.writeFileSync("stripe_purchases_export.md", markdown);
    fs.writeFileSync("stripe_purchases_export.csv", csv);
    
    console.log("\n🎉 Export completed successfully!");
    console.log("Saved files to:");
    console.log("- stripe_purchases_export.md (Markdown format)");
    console.log("- stripe_purchases_export.csv (CSV format)");
  } catch (error) {
    console.error("❌ Stripe API Error:", error.message);
  }
}

exportPurchases();
