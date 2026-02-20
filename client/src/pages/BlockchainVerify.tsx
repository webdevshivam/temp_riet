import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Search, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlockchainVerify() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!hash) return;
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setResult({
        student: "Sarah Jenkins",
        school: "Oakwood High School",
        term: "Spring 2024",
        gpa: "3.8",
        verifiedAt: new Date().toLocaleDateString(),
        blockId: "0x7f2...9a1",
        aiSummary: "Sarah has shown exceptional growth in Mathematics and Science. Her attendance record (98%) demonstrates high consistency."
      });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold font-display">Credential Verification</h1>
        <p className="text-muted-foreground mt-2">Verify student records securely on the blockchain.</p>
      </div>

      <Card className="shadow-lg border-blue-100 dark:border-blue-900/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter Certificate Hash (e.g., 0x8f...)" 
              className="font-mono text-sm"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
            <Button onClick={handleVerify} disabled={loading || !hash}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <Card className="border-l-4 border-l-green-500 overflow-hidden">
              <div className="bg-green-500/10 p-4 flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                <Check className="w-5 h-5" />
                Valid Credential Verified on Chain
              </div>
              <CardContent className="p-6 grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-semibold text-lg">{result.student}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-semibold text-lg">{result.school}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Term</p>
                    <p className="font-medium">{result.term}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GPA</p>
                    <p className="font-medium">{result.gpa}</p>
                  </div>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-semibold">AI Performance Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.aiSummary}
                  </p>
                </div>

                <div className="text-xs font-mono text-muted-foreground pt-4 border-t truncate">
                  Block ID: {result.blockId} • Verified: {result.verifiedAt}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
