import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('@/components/CoinChart'), { ssr: false });

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  date: string;
}

export async function generateStaticParams() {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=10&page=1&sparkline=false');
  const coins = await response.json();
  
  return coins.map((coin: { id: string }) => ({
    id: coin.id,
  }));
}

async function getCoinData(id: string): Promise<CoinData> {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch coin data');
  }
  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    symbol: data.symbol,
    current_price: data.market_data.current_price.usd,
    price_change_percentage_24h: data.market_data.price_change_percentage_24h,
    market_cap: data.market_data.market_cap.usd,
    total_volume: data.market_data.total_volume.usd,
    high_24h: data.market_data.high_24h.usd,
    low_24h: data.market_data.low_24h.usd,
  };
}

function generateMockTransactions(): Transaction[] {
  const mockTransactions: Transaction[] = [];
  for (let i = 0; i < 10; i++) {
    mockTransactions.push({
      id: `tx-${i}`,
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      amount: parseFloat((Math.random() * 1000).toFixed(2)),
      price: parseFloat((Math.random() * 100).toFixed(2)),
      total: parseFloat((Math.random() * 10000).toFixed(2)),
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    });
  }
  return mockTransactions;
}

export default async function CoinPage({ params }: { params: { id: string } }) {
  const coinData = await getCoinData(params.id);
  const transactions = generateMockTransactions();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{coinData.name} ({coinData.symbol.toUpperCase()})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Price Chart (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicChart coinId={params.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coin Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Current Price</TableCell>
                  <TableCell>${coinData.current_price.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">24h Change</TableCell>
                  <TableCell>
                    <Badge variant={coinData.price_change_percentage_24h > 0 ? "success" : "destructive"}>
                      {coinData.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Market Cap</TableCell>
                  <TableCell>${coinData.market_cap.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">24h Volume</TableCell>
                  <TableCell>${coinData.total_volume.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">24h High</TableCell>
                  <TableCell>${coinData.high_24h.toFixed(4)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">24h Low</TableCell>
                  <TableCell>${coinData.low_24h.toFixed(4)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Badge variant={tx.type === 'buy' ? "success" : "destructive"}>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.amount.toFixed(2)} {coinData.symbol.toUpperCase()}</TableCell>
                  <TableCell>${tx.price.toFixed(2)}</TableCell>
                  <TableCell>${tx.total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}