"""Independent numerical checks for hand-written review examples; stdlib only.
No imports from the content generator and no expected values produced by it.
"""
from fractions import Fraction as Q
from itertools import product
from math import exp, isclose, comb
checks=0
def eq(actual,expected):
 global checks
 if isinstance(expected,(tuple,list)):
  assert len(actual)==len(expected),(actual,expected)
  for a,e in zip(actual,expected):eq(a,e)
 elif isinstance(expected,float):assert isclose(float(actual),expected,rel_tol=1e-9,abs_tol=1e-10),(actual,expected)
 else:assert actual==expected,(actual,expected)
 checks+=1
H=lambda a:int(a>=0)
# W1 dimensions, weighted sum, activation, evaluation.
eq((2+2,2*2,2,2),(4,4,2,2))
for x,expected in [((1,2),(Q(13,10),1,0)),((1,0),(Q(1,2),Q(1,2),Q(1,8)))]:
 u=Q(3,5)*x[0]+Q(2,5)*x[1]-Q(1,10);y=min(1,max(0,u));eq((u,y,(1-y)**2/2),expected)
# Veto versus ordinary weighted input.
eq((0 if 1 else 1,H(1+1-1-1)),(0,1))
# Truth tables and threshold design.
xs=list(product([0,1],repeat=2))
eq([H(sum(x)-2) for x in xs],[0,0,0,1]);eq([H(sum(x)-1) for x in xs],[0,1,1,1]);eq([H(-x) for x in [0,1]],[1,0])
eq([H(k-2) for k in range(4)],[0,0,1,1]);eq([H(-k+1) for k in range(4)],[1,1,0,0])
# Decoder exactness over every possible input, not only listed rows.
for pattern in [(1,0,1),(0,1,0)]:
 w=[2*r-1 for r in pattern];theta=sum(pattern)
 for x in product([0,1],repeat=3):eq(H(sum(a*b for a,b in zip(w,x))-theta),int(x==pattern))
for x in product([0,1],repeat=3):
 a=H(x[0]-x[1]+x[2]-2);b=H(-x[0]+x[1]-x[2]-1)
 eq(H(a+b-1),int(x in [(1,0,1),(0,1,0)]))
# Recurrent M-P: synchronous update from a saved tuple.
a=b=0;states=[]
for u in [1,0,1,0]:
 old_a,old_b=a,b
 a=int((u or old_a) and not old_b);b=int((u and old_a) and not old_b)
 states.append((a,b))
eq(states,[(1,0),(1,0),(1,1),(0,0)])
# Bias, parameter-space geometry, finite-set strict threshold.
eq(H(2-3+1),1)
eq([all(H(w[0]*x[0]+w[1]*x[1]-1)==int(all(x)) for x in xs) for w in [(1,.2),(.6,.6),(.2,.6)]],[False,True,False])
eq([H(.6*x[0]+.6*x[1]-.9) for x in xs],[0,0,0,1])
# Perceptron complete online trajectory. All parameters share one old error.
w=[0,0];b=0;epoch_end=[];errors=[]
for epoch in range(6):
 bad=0
 for x in xs:
  t=int(all(x));y=H(sum(wi*xi for wi,xi in zip(w,x))+b);e=t-y;bad+=int(e!=0)
  w=[wi+e*xi for wi,xi in zip(w,x)];b+=e
 epoch_end.append((*w,b));errors.append(bad)
eq(epoch_end,[(1,1,0),(2,1,-1),(2,1,-2),(2,2,-2),(2,1,-3),(2,1,-3)]);eq(errors[-1],0)
# Bipolar recoding preserves all four scores.
for r in xs:
 z=[2*a-1 for a in r]
 eq(Q(1,2)*sum(z)+Q(1,2),sum(r)-Q(1,2))
# ADALINE manual case, with exact rational arithmetic.
x=[1,2];w=[Q(1,5),Q(1,10)];b=Q(0);t=Q(1);eta=Q(1,10)
y=sum(wi*xi for wi,xi in zip(w,x))+b;e=t-y;grad=[-e*xi for xi in x]
eq((y,e,e*e/2),(Q(2,5),Q(3,5),Q(9,50)));eq(grad,[Q(-3,5),Q(-6,5)])
w=[wi-eta*g for wi,g in zip(w,grad)];b+=eta*e;yn=sum(wi*xi for wi,xi in zip(w,x))+b
eq((w,b,yn,(t-yn)**2/2),([Q(13,50),Q(11,50)],Q(3,50),Q(19,25),Q(18,625)))
# Online versus sum-batch versus mean-batch.
b=Q(0)
for t in [1,2]:b+=Q(1,10)*(t-b)
eq((b,Q(1,10)*3,Q(1,10)*3/2),(Q(29,100),Q(3,10),Q(3,20)))
# Capacity formula and XOR hard-threshold MLP.
eq(2*sum(comb(3,k) for k in range(3)),14);eq((2**3,2**(2**3)),(8,256))
eq([H(H(x[0]-x[1]-.5)+H(-x[0]+x[1]-.5)-.5) for x in xs],[0,1,1,0])
# Simple chain rule and hidden unit with two children.
eq(Q(-1,2)*Q(1,4)*2,Q(-1,4))
dh=Q(1,4)*(Q(3,5)*Q(-1,5)+Q(-2,5)*Q(1,10));eq((dh,dh*2),(Q(-1,25),Q(-2,25)))
# Full BP example. Parameter order differs from the content's table for independence.
# [hidden bias 1, hidden bias 2, output bias, W11,W12,W21,W22,V1,V2]
sigmoid=lambda u:1/(1+exp(-u))
def forward(p):
 h=[sigmoid(p[0]+p[3]+2*p[4]),sigmoid(p[1]+p[5]+2*p[6])]
 y=sigmoid(p[2]+p[7]*h[0]+p[8]*h[1])
 return h,y,.5*(y-1)**2
p=[-.5,0,-.1,.1,.2,-.2,.1,.4,-.2]
h,y,L=forward(p);eq((h,y,L),([.5,.5],.5,.125))
do=(y-1)*y*(1-y);dh=[h[j]*(1-h[j])*p[7+j]*do for j in range(2)]
g=[dh[0],dh[1],do,dh[0],2*dh[0],dh[1],2*dh[1],do*h[0],do*h[1]]
expected=[-.0125,.00625,-.125,-.0125,-.025,.00625,.0125,-.0625,-.0625];eq(g,expected)
# Independently test every analytic gradient by central finite differences.
for i,analytic in enumerate(g):
 plus=p.copy();minus=p.copy();eps=1e-5;plus[i]+=eps;minus[i]-=eps
 numeric=(forward(plus)[2]-forward(minus)[2])/(2*eps)
 assert abs(numeric-analytic)<1e-8,(i,numeric,analytic)
 checks+=1
pn=[v-.1*gradient for v,gradient in zip(p,g)]
eq(pn,[-.49875,-.000625,-.0875,.10125,.2025,-.200625,.09875,.40625,-.19375])
hn,yn,lossn=forward(pn);eq(hn,[.5018749912,.4990625011]);eq((yn,lossn),(.5049231798,.1225505290));assert lossn<L
# Momentum, preserving the previous full increment.
q=Q(1);v=Q(-1,50);trajectory=[]
for gradient in [Q(3,10),Q(-1,5)]:
 v=Q(9,10)*v-Q(1,10)*gradient;q+=v;trajectory.append((v,q))
eq(trajectory,[(Q(-6,125),Q(119,125)),(Q(-29,1250),Q(1161,1250))])
# Generalization counterexample.
for x in [0,1]:eq(x+4*x*(1-x),x)
x=Q(1,2);prediction=x+4*x*(1-x);eq((prediction,(prediction-x)**2/2),(Q(3,2),Q(1,2)))
print(f"PASS: {checks} independent numeric assertions; all 9 BP gradients also pass finite differences.")
