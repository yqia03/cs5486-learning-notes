#!/usr/bin/env python3
"""Independent numerical checks for midterm Week 04/05 examples; stdlib only.
Hand-derived answers are constants below. No content generator, local materials,
JSON, PDF, third-party package or repository state is imported.
"""
from fractions import Fraction as F
from math import exp, sqrt, log, isclose

def eq(a,b,tol=1e-9):
    assert isclose(float(a),float(b),rel_tol=tol,abs_tol=tol),(a,b)

def dot(a,b): return sum(x*y for x,y in zip(a,b))
def matvec(a,v): return [dot(r,v) for r in a]
def solve(a,b):
    z=[[F(x) for x in row]+[F(y)] for row,y in zip(a,b)]
    n=len(z)
    for k in range(n):
        j=next(i for i in range(k,n) if z[i][k])
        z[k],z[j]=z[j],z[k]
        pivot=z[k][k]
        z[k]=[x/pivot for x in z[k]]
        for i in range(n):
            if i!=k:
                multiplier=z[i][k]
                z[i]=[x-multiplier*y for x,y in zip(z[i],z[k])]
    return [row[-1] for row in z]

def gaussian(x,z,sigma):return exp(-sum((a-b)**2 for a,b in zip(x,z))/sigma**2)
# RBF forward, independently compute vector and output.
features=[gaussian([1],[c],1) for c in [0,2]]
eq(dot(features,[2,-1])+F(1,2),0.8678794411714423)
eq(gaussian([0],[2],1),exp(-4))
# RBF output weights: exact Gaussian values chosen through width.
sigma=sqrt(1/log(2))
H=[[gaussian([x],[c],sigma) for c in [0,1]] for x in [0,1]]
a=solve([[1,F(1,2)],[F(1,2),1]],[1,0])
assert a==[F(4,3),F(-2,3)]
for got,want in zip(matvec(H,a),[1,0]):eq(got,want)
# RBF XOR uses fixed center order and is classification, not interpolation.
points=[(0,0),(0,1),(1,0),(1,1)]
labels=[-1,1,1,-1]
for x,y,want in zip(points,labels,[-.2353352832366127,.1642411176571153,.1642411176571153,-.2353352832366127]):
    g=.9-sum(gaussian(x,c,1) for c in [(1,1),(0,0)])
    eq(g,want); assert y*g>0
# FLN binary XOR identity.
assert [x+y-2*x*y for x,y in points]==[0,1,1,0]
# Margin scaling and outlier example.
for w,b in [(1,-1),(10,-10)]:eq((w*2+b)/abs(w),1)
eq((2-1.8)/2,.1)
# Hard-margin KKT certificate, including non-support third point.
x=[[-1],[1],[2]]; y=[-1,1,1]; alpha=[F(1,2),F(1,2),F(0)]
w=[sum(a*yi*xi[0] for a,yi,xi in zip(alpha,y,x))]; b=0
assert w==[1];assert dot(alpha,y)==0
margin=[yi*(dot(w,xi)+b) for yi,xi in zip(y,x)]
assert margin==[1,1,2]
for a,m in zip(alpha,margin): assert a>=0 and m>=1 and a*(m-1)==0
primal=dot(w,w)/2
Q=[[yi*yj*dot(xi,xj) for yj,xj in zip(y,x)] for yi,xi in zip(y,x)]
dual=sum(alpha)-dot(alpha,matvec(Q,alpha))/2
eq(primal,.5);eq(primal,dual);eq(dot(w,[-.5]),-.5)
# Soft-margin status and C values; scalar stationary candidate checked with KKT.
g=[1.4,.3,.2,-1];y=[1,1,-1,-1]
slack=[max(0,1-yi*gi) for yi,gi in zip(y,g)]
for u,v in zip(slack,[0,.7,1.2,0]):eq(u,v)
eq(sum(slack),1.9);assert sum(yi*gi<0 for yi,gi in zip(y,g))==1
for C,expected_w,expected_J in [(.1,.2,.18),(1,1,.5)]:
    # Solve piecewise derivative, then compare adjoining endpoint.
    candidates=[0,1,max(0,min(2*C,1))]
    J=lambda w:w*w/2+2*C*max(0,1-w)
    w=min(candidates,key=J)
    eq(w,expected_w);eq(J(w),expected_J)
    a=w/2
    assert 0<=a<=C
    xi=max(0,1-w)
    eq(a*(w-1+xi),0);eq((C-a)*xi,0)
# All optimal soft-margin bias interval samples; outside values violate constraints.
for b in [-.8,-.2,0,.8]:
    margins=[.2-b,.2+b];xis=[.8+b,.8-b]
    for m,xi in zip(margins,xis):
        assert xi>=-1e-12;eq(.1*(m-1+xi),0)
    eq(.2**2/2+.1*sum(xis),.18)
# Explicit polynomial features and Gram.
feature=lambda x:[1,x[0]**2,sqrt(2)*x[0]*x[1],x[1]**2,sqrt(2)*x[0],sqrt(2)*x[1]]
x=[1,2];z=[3,-1]
eq(dot(feature(x),feature(z)),4)
poly=lambda x,z:(1+dot(x,z))**2
G=[[poly(u,v) for v in [x,z]] for u in [x,z]]
assert G==[[36,4],[4,121]];assert G[0][0]*G[1][1]-G[0][1]*G[1][0]==4340
assert dot([1,-1],matvec([[1,2],[2,1]],[1,-1]))==-2
for s,want in [(.5,.1353352832366127),(1,.6065306597126334),(2,.8824969025845955)]:eq(exp(-1/(2*s*s)),want)
# Kernel classification: full feasible optimum and prediction from valid kernel.
s2=2/log(2)
k=lambda x,z:exp(-(x-z)**2/(2*s2))
x=[-1,1];y=[-1,1];alpha=[2,2];C=3
G=[[k(u,v) for v in x] for u in x]
for row,want in zip(G,[[1,.5],[.5,1]]):
    for u,v in zip(row,want):eq(u,v)
score=lambda z:sum(a*yi*k(xi,z) for a,yi,xi in zip(alpha,y,x))
assert dot(alpha,y)==0
for a,yi,xi in zip(alpha,y,x):assert 0<a<C;eq(yi*score(xi),1)
eq(score(2),1.2613446228805718);eq(score(0),0)
# SVR loss and two slack directions.
for eps,expected in [(.5,[0,.6,.5]),(1,[0,.1,0])]:
    r=[t-10 for t in [10.2,11.1,9.0]]
    for ri,loss in zip(r,expected):
        xi=max(0,ri-eps);xis=max(0,-ri-eps)
        eq(xi+xis,loss);assert xi*xis==0

def svr_kkt(xs,ts,alpha,astar,C,eps,b,expect_J):
    beta=[a-s for a,s in zip(alpha,astar)]
    eq(sum(beta),0)
    w=dot(beta,xs)
    pred=[w*x+b for x in xs]
    xi=[max(0,t-f-eps) for t,f in zip(ts,pred)]
    xis=[max(0,f-t-eps) for t,f in zip(ts,pred)]
    for t,f,a,s,u,v in zip(ts,pred,alpha,astar,xi,xis):
        assert 0<=a<=C and 0<=s<=C
        assert t-f<=eps+u+1e-9 and f-t<=eps+v+1e-9
        eq(a*(t-f-eps-u),0);eq(s*(f-t-eps-v),0)
        eq((C-a)*u,0);eq((C-s)*v,0)
    P=w*w/2+C*(sum(xi)+sum(xis))
    K=[[u*v for v in xs] for u in xs]
    D=-dot(beta,matvec(K,beta))/2-eps*(sum(alpha)+sum(astar))+dot(ts,beta)
    eq(P,expect_J);eq(P,D)
    return w,pred,xi,xis
# Free-support-vector SVR answer and both bias reconstructions.
w,p,xi,xis=svr_kkt([0,2],[0,2],[0,.25],[.25,0],1,.5,.5,.125)
eq(w,.5);eq(w*3+.5,2)
eq(0+.5-w*0,.5);eq(2-.5-w*2,.5)
# No-free-SV interval from all four KKT inequality classes.
a=[0,.1];s=[.1,0];A=[0,1.6];C=.1;eps=.5
lower=[];upper=[]
for ai,si,Ai in zip(a,s,A):
    if ai<C:lower.append(Ai-eps)
    if ai>0:upper.append(Ai-eps)
    if si<C:upper.append(Ai+eps)
    if si>0:lower.append(Ai+eps)
eq(max(lower),.5);eq(min(upper),1.1)
for b in [.5,.8,1.1]:svr_kkt([0,2],[0,2],a,s,C,eps,b,.08)
# Epsilon zero counterexample: both dual multipliers strictly positive, same model.
svr_kkt([0],[0],[.5],[.5],1,0,0,0)
print('Week 04/05 numerical checks passed: RBF, XOR, FLN, margins, hard/soft KKT, kernels, SVR primal/dual/boundaries.')
