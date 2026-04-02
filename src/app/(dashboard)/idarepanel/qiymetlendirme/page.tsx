import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Medal,
  Scale,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getScoringResults } from './actions';
import { PublishResultsButton } from './publish-button';

export default async function QiymetlendirmeNeticePage() {
  const data = await getScoringResults();

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qiymetlendirme Neticeleri</h1>
          <p className="text-muted-foreground">Juri qiymetlendirmelerinin yekun neticeleri</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Scale className="mb-3 size-12" />
            <p className="font-medium">Hec bir qiymetlendirme raund tapilmadi</p>
            <p className="text-sm mt-1">Evvelce Munsifler bolmesinden raund yaradin ve jurileri teyin edin</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxPossible = data.criteria.reduce((sum, c) => sum + c.maxScore, 0);
  const allJudgesDone = data.judges.every(j => j.completedCount === j.totalCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qiymetlendirme Neticeleri</h1>
          <p className="text-muted-foreground">
            {data.roundName} - Juri qiymetlendirmelerinin yekun neticeleri
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            Maks bal: {maxPossible}
          </Badge>
          <PublishResultsButton
            roundId={data.roundId}
            isPublished={data.isPublished}
            allJudgesDone={allJudgesDone}
          />
        </div>
      </div>

      {/* Judges overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-[#0D47A1]" />
            Juri Statusu
          </CardTitle>
          <CardDescription>Her jurinin qiymetlendirme proqresi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.judges.map((judge) => {
              const pct = judge.totalCount > 0
                ? Math.round((judge.completedCount / judge.totalCount) * 100)
                : 0;
              const isDone = judge.completedCount === judge.totalCount;

              return (
                <div key={judge.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className={`flex size-10 items-center justify-center rounded-full ${isDone ? 'bg-[#6BBF6B]/10' : 'bg-amber-100'}`}>
                    {isDone ? (
                      <CheckCircle2 className="size-5 text-[#6BBF6B]" />
                    ) : (
                      <Clock className="size-5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{judge.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {judge.completedCount}/{judge.totalCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Final Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            Yekun Siralama
          </CardTitle>
          <CardDescription>
            Butun jurilerin verdikleri ballarin ortalamasi esasinda siralama
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Yer</TableHead>
                <TableHead>Komanda</TableHead>
                <TableHead>Istiqamet</TableHead>
                <TableHead className="text-center">Juriler</TableHead>
                <TableHead className="text-center">Ortalama bal</TableHead>
                <TableHead className="text-center">Umumi bal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Hec bir komanda qiymetlendirilmeyib
                  </TableCell>
                </TableRow>
              ) : (
                data.teams.map((team, idx) => {
                  const rank = idx + 1;
                  return (
                    <TableRow key={team.teamId} className={rank <= 3 ? 'bg-amber-50/50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {rank <= 3 ? (
                            <Medal className={`size-5 ${
                              rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : 'text-amber-700'
                            }`} />
                          ) : (
                            <span className="text-muted-foreground font-medium ml-1">{rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{team.teamName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{team.track || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={team.judgesCompleted === team.judgesTotal ? 'text-[#6BBF6B]' : 'text-amber-500'}>
                          {team.judgesCompleted}/{team.judgesTotal}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-bold text-[#0D47A1]">
                          {team.averageTotal}
                        </span>
                        <span className="text-xs text-muted-foreground">/{maxPossible}</span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {team.grandTotal}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed scores per team */}
      {data.teams.filter((t) => t.judges.some((j) => j.total > 0)).map((team, idx) => (
        <Card key={team.teamId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {idx < 3 && <Medal className={`size-5 ${
                  idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : 'text-amber-700'
                }`} />}
                {team.teamName}
              </CardTitle>
              <Badge variant="outline">{team.track || '-'}</Badge>
            </div>
            <CardDescription>
              Her jurinin verdikleri ballar (meyar uzre)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Juri</TableHead>
                    {data.criteria.map((c) => (
                      <TableHead key={c.id} className="text-center min-w-[80px]" title={c.name}>
                        {c.name.split(' ')[0]}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold">Cemi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.judges.map((judge) => (
                    <TableRow key={judge.judgeId}>
                      <TableCell className="font-medium">{judge.judgeName}</TableCell>
                      {data.criteria.map((c) => (
                        <TableCell key={c.id} className="text-center">
                          <span className={judge.criteriaScores[c.id] > 0 ? '' : 'text-muted-foreground'}>
                            {judge.criteriaScores[c.id] ?? 0}
                          </span>
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold text-[#0D47A1]">
                        {judge.total}
                      </TableCell>
                      <TableCell className="text-center">
                        {judge.isCompleted ? (
                          <Badge className="bg-[#6BBF6B] text-white">Tam</Badge>
                        ) : (
                          <Badge variant="secondary">Gozleyir</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Average row */}
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell>Ortalama</TableCell>
                    {data.criteria.map((c) => {
                      const vals = team.judges.map((j) => j.criteriaScores[c.id] ?? 0);
                      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                      return (
                        <TableCell key={c.id} className="text-center">
                          {Math.round(avg * 10) / 10}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center text-[#0D47A1] text-lg">
                      {team.averageTotal}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
