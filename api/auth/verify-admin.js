export default async function handler(req,res){
  const p = (req.body?.password || "").toString().trim()
  const allowed = ["Admin@smart2026", "Admin@Smart2026", "Admin@SMART2026"]
  if (allowed.map(x=>x.toLowerCase()).includes(p.toLowerCase())){
    return res.status(200).json({
      success: true,
      user: {
        role: "admin",
        roleType: "super_admin",
        isSuperAdmin: true,
        name: "Super Admin (System Owner)",
        marathiName: "सुपर ॲडमिन (प्रणाली मालक)",
        identifier: "SUPER-ADMIN-2026",
        title: "Super Administrator & Multi-School Authority",
        avatar: "👑",
        loginTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    })
  }
  return res.status(401).json({ success: false, error: "Invalid password" })
}
