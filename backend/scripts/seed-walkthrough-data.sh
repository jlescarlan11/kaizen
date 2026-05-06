#!/usr/bin/env bash
# One-time test-data seeder for the UI/UX walkthrough audit.
# Generates ~28 random transactions across categories, dates, amounts, and types
# so dense-list / pagination / filter / chart findings can surface during Session A.
#
# Usage:
#   1. Log into the dev app in your browser.
#   2. Open DevTools → Network tab → click any /api/* request → Headers tab.
#   3. Copy the value of the "Authorization" header (starts with "Bearer ...").
#   4. Run: ./backend/scripts/seed-walkthrough-data.sh "<bearer token>"
#
# Safe to re-run; each call adds 28 fresh transactions on top of whatever exists.
# Goes through the real API so balance + budget expense recalc happens.

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
N_TX="${N_TX:-28}"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <bearer-token>"
  echo "  See header comment for how to grab the token from DevTools."
  exit 1
fi

TOKEN="$1"
AUTH_HEADER="Authorization: Bearer ${TOKEN#Bearer }"

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required but not installed. brew install jq" >&2
  exit 1
fi

echo "==> Fetching payment methods..."
PM_JSON=$(curl -fsS -H "$AUTH_HEADER" "$BASE_URL/api/payment-methods")
PM_IDS=($(echo "$PM_JSON" | jq -r '.[].id'))
if [[ ${#PM_IDS[@]} -eq 0 ]]; then
  echo "ERROR: No payment methods found. Add at least one in the UI first." >&2
  exit 1
fi
echo "    Found ${#PM_IDS[@]} payment method(s)."

echo "==> Fetching categories..."
CAT_JSON=$(curl -fsS -H "$AUTH_HEADER" "$BASE_URL/api/categories")
CAT_IDS=($(echo "$CAT_JSON" | jq -r '.[].id'))
if [[ ${#CAT_IDS[@]} -eq 0 ]]; then
  echo "ERROR: No categories found." >&2
  exit 1
fi
echo "    Found ${#CAT_IDS[@]} categor(y/ies)."

# Realistic descriptions per "kind" — sampled randomly per transaction.
EXPENSE_DESCS=(
  "Grocery run at SM" "Lunch with team" "Jeepney fare" "Coffee at the corner cafe"
  "Internet bill" "Electricity bill" "Mobile load" "Streaming subscription"
  "Birthday gift" "Pharmacy" "Hardware store" "Petrol top-up"
  "Weekend brunch" "Movie tickets" "Bookstore" "Snack run"
  "Taxi home" "Ride share" "Shopping spree" "New shoes"
  "Plant from nursery" "Stationery" "Coffee beans"
)
INCOME_DESCS=(
  "Freelance project payment" "Side hustle income" "Refund — utility overpay"
  "Cashback" "Sold old gadget" "Gift from family"
)

# Random integer in [min, max] inclusive.
randint() {
  local min="$1" max="$2"
  echo $(( min + RANDOM % (max - min + 1) ))
}

# Random element from an array passed as the rest of the args.
randpick() {
  local arr=("$@")
  echo "${arr[$(( RANDOM % ${#arr[@]} ))]}"
}

# Random transaction date in last 90 days (ISO 8601 with offset).
random_date() {
  local days_back=$(randint 0 90)
  # macOS date supports -v
  date -u -v-${days_back}d +"%Y-%m-%dT%H:%M:%S+00:00"
}

CREATED=0
FAILED=0

echo "==> Seeding ${N_TX} transactions..."
for i in $(seq 1 "$N_TX"); do
  # 80% expense, 20% income
  if (( RANDOM % 5 == 0 )); then
    TYPE="INCOME"
    AMOUNT=$(randint 1500 15000).00
    DESC=$(randpick "${INCOME_DESCS[@]}")
  else
    TYPE="EXPENSE"
    AMOUNT=$(randint 25 2500).00
    DESC=$(randpick "${EXPENSE_DESCS[@]}")
  fi

  CAT_ID=$(randpick "${CAT_IDS[@]}")
  PM_ID=$(randpick "${PM_IDS[@]}")
  TX_DATE=$(random_date)
  CGID="seed-$(date +%s)-${i}-${RANDOM}"

  PAYLOAD=$(jq -n \
    --arg amount "$AMOUNT" \
    --arg type "$TYPE" \
    --arg date "$TX_DATE" \
    --arg desc "$DESC" \
    --argjson cat "$CAT_ID" \
    --argjson pm "$PM_ID" \
    --arg cgid "$CGID" \
    '{
      amount: ($amount | tonumber),
      type: $type,
      transactionDate: $date,
      description: $desc,
      categoryId: $cat,
      paymentMethodId: $pm,
      isRecurring: false,
      clientGeneratedId: $cgid
    }')

  if HTTP_RESP=$(curl -fsS -w "\n%{http_code}" -X POST \
       -H "$AUTH_HEADER" \
       -H "Content-Type: application/json" \
       --data "$PAYLOAD" \
       "$BASE_URL/api/transactions" 2>&1); then
    CREATED=$((CREATED + 1))
    printf "  [%2d/%d] %s %s %-30s\n" "$i" "$N_TX" "$TYPE" "PHP $AMOUNT" "$DESC"
  else
    FAILED=$((FAILED + 1))
    echo "  [$i/$N_TX] FAILED: $HTTP_RESP"
  fi
done

echo
echo "==> Done. Created: $CREATED. Failed: $FAILED."
echo "    Refresh the Home page to see the new transactions."
