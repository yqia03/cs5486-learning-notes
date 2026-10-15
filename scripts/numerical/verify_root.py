from fractions import Fraction as F
# Independently authored exact arithmetic expectations; no content generator import.
a=[F(4,5),F(1,2),F(3,10)]; strength=F(1,5)
expected=[['0.64','0.28','0.04'],['0.576','0.144','0'],['0.5472','0.0288','0'],['0.54144','0','0']]
for row in expected:
 matrix=[[F(1) if i==j else -strength for j in range(3)] for i in range(3)]
 a=[max(F(0),sum(coef*v for coef,v in zip(r,a))) for r in matrix]
 assert a==[F(v) for v in row]
assert sum(v>0 for v in a)==1
assert a[0]!=F(4,5)
for initial in ([F(1),F(1)],[F(0),F(0)]):
 a=initial
 for t in range(1,8):
  a=[max(F(0),a[0]-strength*a[1]),max(F(0),a[1]-strength*a[0])]
  assert a[0]==a[1]==initial[0]*F(4,5)**t
# New MAXNET self-test.
a=[F(3),F(1),F(0)]
a=[max(F(0),v-strength*(sum(a)-v)) for v in a];assert a==[F(14,5),F(2,5),F(0)]
a=[max(F(0),v-strength*(sum(a)-v)) for v in a];assert a==[F(68,25),F(0),F(0)]
# LS regression self-test hand-derived: x=(-1,1), y=(1,3), gamma=1.
x=[F(-1),F(1)];y=[F(1),F(3)];alpha=[-F(1,3),F(1,3)];b=F(2)
w=sum(u*v for u,v in zip(x,alpha));assert w==F(2,3)
assert sum(alpha)==0
assert [target-(w*xi+b) for xi,target in zip(x,y)]==alpha
assert w*2+b==F(10,3)
print('PASS: MAXNET all rounds, ties, zero; self-test MAXNET and LS-SVM back-substitution')

assert [int(sum(x)-F(3,2)>=0) for x in [(0,0),(1,0),(0,1),(1,1)]]==[0,0,0,1]
