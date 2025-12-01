import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { Metric, MetricType, CreateMetricInput } from '../../../types/domain';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Loader2, Activity, Server, Cpu, AlertTriangle } from 'lucide-react';

export default function AdminProjectPerformance() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projectService } = useProject();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [projectId]);

  const loadMetrics = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await projectService.getMetrics(projectId);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateIngestion = async () => {
    if (!projectId) return;
    setSimulating(true);
    try {
      // Simulate a few metrics
      const now = new Date().toISOString();
      const inputs: CreateMetricInput[] = [
        {
          type: 'RESPONSE_TIME',
          name: 'API Latency',
          value: Math.floor(Math.random() * 200) + 50,
          unit: 'ms',
          timestamp: now,
          environment: 'PROD',
        },
        {
          type: 'CPU_USAGE',
          name: 'Web Server CPU',
          value: Math.floor(Math.random() * 60) + 10,
          unit: '%',
          timestamp: now,
          environment: 'PROD',
        },
        {
          type: 'MEMORY_USAGE',
          name: 'Web Server Memory',
          value: Math.floor(Math.random() * 40) + 30,
          unit: '%',
          timestamp: now,
          environment: 'PROD',
        },
        {
          type: 'ERROR_RATE',
          name: '5xx Errors',
          value: Math.random() > 0.8 ? 1 : 0,
          unit: 'count',
          timestamp: now,
          environment: 'PROD',
        },
      ];

      for (const input of inputs) {
        await projectService.createMetric(projectId, input);
      }
      await loadMetrics();
    } catch (error) {
      console.error('Failed to simulate metrics:', error);
    } finally {
      setSimulating(false);
    }
  };

  const getLatestValue = (type: MetricType) => {
    const found = metrics.find((m) => m.type === type);
    return found ? `${found.value} ${found.unit || ''}` : 'N/A';
  };

  const getAverage = (type: MetricType) => {
    const filtered = metrics.filter((m) => m.type === type);
    if (filtered.length === 0) return 'N/A';
    const sum = filtered.reduce((acc, curr) => acc + curr.value, 0);
    const avg = sum / filtered.length;
    return `${avg.toFixed(1)} ${filtered[0].unit || ''}`;
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Performance Metrics
          </h2>
          <p className='text-muted-foreground'>
            Real-time application performance monitoring and KPIs.
          </p>
        </div>
        <Button onClick={simulateIngestion} disabled={simulating}>
          {simulating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Ingesting...
            </>
          ) : (
            <>
              <Activity className='mr-2 h-4 w-4' />
              Simulate Ingestion
            </>
          )}
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg Response Time
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {getAverage('RESPONSE_TIME')}
            </div>
            <p className='text-xs text-muted-foreground'>
              Latest: {getLatestValue('RESPONSE_TIME')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>CPU Usage</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{getAverage('CPU_USAGE')}</div>
            <p className='text-xs text-muted-foreground'>
              Latest: {getLatestValue('CPU_USAGE')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Memory Usage</CardTitle>
            <Server className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {getAverage('MEMORY_USAGE')}
            </div>
            <p className='text-xs text-muted-foreground'>
              Latest: {getLatestValue('MEMORY_USAGE')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Error Rate</CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{getAverage('ERROR_RATE')}</div>
            <p className='text-xs text-muted-foreground'>
              Latest: {getLatestValue('ERROR_RATE')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {metrics.slice(0, 10).map((metric) => (
              <div
                key={metric.id}
                className='flex items-center justify-between border-b pb-2 last:border-0 last:pb-0'
              >
                <div className='flex items-center gap-4'>
                  <div className={`p-2 rounded-full bg-muted`}>
                    {metric.type === 'RESPONSE_TIME' && (
                      <Activity className='h-4 w-4' />
                    )}
                    {metric.type === 'CPU_USAGE' && <Cpu className='h-4 w-4' />}
                    {metric.type === 'MEMORY_USAGE' && (
                      <Server className='h-4 w-4' />
                    )}
                    {metric.type === 'ERROR_RATE' && (
                      <AlertTriangle className='h-4 w-4' />
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{metric.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(metric.timestamp).toLocaleString()} •{' '}
                      {metric.environment}
                    </p>
                  </div>
                </div>
                <div className='font-mono text-sm'>
                  {metric.value} {metric.unit}
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <p className='text-center text-muted-foreground py-4'>
                No metrics recorded yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
