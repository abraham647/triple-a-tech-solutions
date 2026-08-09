import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, XCircle, User } from "lucide-react";

const EmployeeVerify = () => {
  const { qrCode } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!qrCode) { setError("Invalid QR code"); setLoading(false); return; }
      const { data, error: err } = await supabase.functions.invoke("verify-employee", {
        body: { qr_code: qrCode },
      });
      const record = (data as any)?.employee;

      if (err || !record) {
        setError("Employee not found or card is invalid.");
      } else if (!record.is_active) {
        setError("This employee card has been deactivated.");
      } else {
        setEmployee(record);
      }

      setLoading(false);
    };
    verify();
  }, [qrCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-display">Verifying...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
          <h1 className="font-display font-bold text-xl">Employee Verification</h1>
          <p className="text-muted-foreground text-sm">Triple A Tech Solutions</p>
        </div>

        {error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h2 className="font-semibold text-lg mb-1">Verification Failed</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        ) : employee && (
          <div className="bg-card border border-primary/30 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="font-semibold text-lg text-primary mb-4">Verified Employee</h2>
            
            {employee.photo_url ? (
              <img src={employee.photo_url} alt={employee.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}

            <h3 className="font-display font-bold text-xl">{employee.name}</h3>
            <p className="text-primary font-medium">{employee.role}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Employed since {new Date(employee.hired_at).toLocaleDateString()}
            </p>
            <div className="mt-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold inline-block">
              ✅ Active Employee
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeVerify;
