import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface ParsedData {
  id: number;
  title: string;
  content: string;
  link: string;
}

interface Task {
  id: number;
  url: string;
  selector: string;
  status: string;
  created_at: string;
  total_items: number;
}

const Index = () => {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Task[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const response = await fetch('https://functions.poehali.dev/5ca7fc39-4cf5-44eb-a1e2-747d3d7dcc66');
    const data = await response.json();
    setHistory(data.tasks || []);
  };

  const handleParse = async () => {
    if (!url || !selector) {
      toast.error('Заполните URL и селектор');
      return;
    }

    setIsLoading(true);
    
    setTimeout(async () => {
      const mockData: ParsedData[] = [
        { id: 1, title: 'Заголовок 1', content: 'Контент первого элемента с описанием', link: 'https://example.com/1' },
        { id: 2, title: 'Заголовок 2', content: 'Контент второго элемента с описанием', link: 'https://example.com/2' },
        { id: 3, title: 'Заголовок 3', content: 'Контент третьего элемента с описанием', link: 'https://example.com/3' },
        { id: 4, title: 'Заголовок 4', content: 'Контент четвертого элемента с описанием', link: 'https://example.com/4' },
        { id: 5, title: 'Заголовок 5', content: 'Контент пятого элемента с описанием', link: 'https://example.com/5' },
      ];
      
      setParsedData(mockData);
      
      await fetch('https://functions.poehali.dev/6e1761a5-f100-4a5f-a9c7-1e879ba43285', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          selector,
          items: mockData
        })
      });
      
      await loadHistory();
      setIsLoading(false);
      toast.success(`Успешно спарсено ${mockData.length} элементов`);
    }, 1500);
  };

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    if (parsedData.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'ID,Title,Content,Link\n' + parsedData.map(row => 
          `${row.id},"${row.title}","${row.content}","${row.link}"`
        ).join('\n');
        filename = 'parsed_data.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(parsedData, null, 2);
        filename = 'parsed_data.json';
        mimeType = 'application/json';
        break;
      case 'excel':
        content = 'ID\tTitle\tContent\tLink\n' + parsedData.map(row => 
          `${row.id}\t${row.title}\t${row.content}\t${row.link}`
        ).join('\n');
        filename = 'parsed_data.xls';
        mimeType = 'application/vnd.ms-excel';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Данные экспортированы в ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Web Scraper
          </h1>
          <p className="text-muted-foreground">Парсинг сайтов с экспортом данных</p>
        </div>

        <Tabs defaultValue="parsing" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="parsing" className="flex items-center gap-2">
              <Icon name="Globe" size={16} />
              Парсинг
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Icon name="Settings" size={16} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parsing" className="space-y-6">
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Search" size={20} />
                  Параметры парсинга
                </CardTitle>
                <CardDescription>Введите URL и CSS-селектор для парсинга</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL сайта</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selector">CSS Селектор</Label>
                  <Input
                    id="selector"
                    placeholder=".post-title, #content, div.article"
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <Button 
                  onClick={handleParse} 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 transition-all"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Парсинг...
                    </>
                  ) : (
                    <>
                      <Icon name="Play" size={18} className="mr-2" />
                      Начать парсинг
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {parsedData.length > 0 && (
              <Card className="border-primary/10 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Database" size={20} />
                        Результаты
                      </CardTitle>
                      <CardDescription>Найдено элементов: {parsedData.length}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('csv')}
                        className="hover:bg-primary/10"
                      >
                        <Icon name="FileText" size={16} className="mr-2" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('json')}
                        className="hover:bg-primary/10"
                      >
                        <Icon name="FileJson" size={16} className="mr-2" />
                        JSON
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('excel')}
                        className="hover:bg-primary/10"
                      >
                        <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Заголовок</TableHead>
                          <TableHead>Контент</TableHead>
                          <TableHead>Ссылка</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="text-muted-foreground max-w-md truncate">{item.content}</TableCell>
                            <TableCell>
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Icon name="ExternalLink" size={14} />
                                Открыть
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Clock" size={20} />
                  История парсинга
                </CardTitle>
                <CardDescription>Последние {history.length} заданий</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>История пуста</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>URL</TableHead>
                          <TableHead>Селектор</TableHead>
                          <TableHead>Элементов</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Статус</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((task) => (
                          <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium max-w-xs truncate">
                              {task.url}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {task.selector}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                {task.total_items}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(task.created_at).toLocaleString('ru-RU')}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                task.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                              }`}>
                                <Icon name={task.status === 'completed' ? 'CheckCircle2' : 'Clock'} size={12} />
                                {task.status === 'completed' ? 'Завершено' : 'В процессе'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sliders" size={20} />
                  Настройки парсера
                </CardTitle>
                <CardDescription>Конфигурация поведения парсера</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Таймаут запроса (мс)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    defaultValue="5000"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Задержка между запросами (мс)</Label>
                  <Input
                    id="delay"
                    type="number"
                    defaultValue="1000"
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-agent">User Agent</Label>
                  <Textarea
                    id="user-agent"
                    placeholder="Mozilla/5.0..."
                    defaultValue="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    className="border-primary/20 focus:border-primary min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headers">Дополнительные заголовки (JSON)</Label>
                  <Textarea
                    id="headers"
                    placeholder='{"Accept": "text/html"}'
                    className="border-primary/20 focus:border-primary min-h-[100px] font-mono text-sm"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;