#!/usr/bin/env python3
"""Independent arithmetic checks for the midterm mathematics and LS-SVM examples.
Uses only the standard library; no authoring script, HTML, local PDF, or network.
Expected values were hand-derived before this independent elimination check.
"""
from fractions import Fraction as F
from math import exp, log, isclose
checks = 0

def equal(actual, expected):
    global checks
    checks += 1
    assert actual == expected, (actual, expected)

def close(actual, expected, tol=1e-8):
    global checks
    checks += 1
    assert isclose(float(actual), float(expected), rel_tol=tol, abs_tol=tol), (actual, expected)

def dot(a, b):
    return sum(x*y for x, y in zip(a,b))

def mv(A, x):
    return [dot(row,x) for row in A]

def solve(A, b):
    """Gauss-Jordan elimination with exact rational arithmetic."""
    n=len(b)
    M=[[F(v) for v in row]+[F(y)] for row,y in zip(A,b)]
    for j in range(n):
        p=next(k for k in range(j,n) if M[k][j])
        M[j],M[p]=M[p],M[j]
        divisor=M[j][j]
        M[j]=[v/divisor for v in M[j]]
        for k in range(n):
            if k!=j:
                factor=M[k][j]
                M[k]=[v-factor*w for v,w in zip(M[k],M[j])]
    return [row[-1] for row in M]

def row_sub(M, target, source, factor):
    M[target]=[v-factor*w for v,w in zip(M[target],M[source])]

def fd(fun, x, index, h=1e-6):
    plus=list(x); minus=list(x)
    plus[index]+=h; minus[index]-=h
    return (fun(plus)-fun(minus))/(2*h)

# Dimensions, matrix action and quadratic form.
A=[[1,2],[-1,1]]; x=[2,-1]; w=[1,3]
equal(mv(A,x),[0,-3]); equal(dot(w,x),-1); equal(dot(w,mv(A,x)),-9)
Q=[[2,1],[1,3]]; u=[1,-1]; c=[1,0]
equal(mv(Q,u),[1,-2]); equal(F(1,2)*dot(u,mv(Q,u))-dot(c,u),F(1,2))
q=lambda p: .5*dot(p,mv(Q,p))-dot(c,p)
close(fd(q,u,0),0); close(fd(q,u,1),-2)
linear_loss=lambda p:.5*(p[0]*2+p[1]-3)**2
close(linear_loss([1,0]),.5); close(fd(linear_loss,[1,0],0),-2); close(fd(linear_loss,[1,0],1),-1)
sigmoid_loss=lambda p:.5*(1/(1+exp(-(p[0]*2+p[1])))-1)**2
close(sigmoid_loss([0,0]),F(1,8)); close(fd(sigmoid_loss,[0,0],0),F(-1,4)); close(fd(sigmoid_loss,[0,0],1),F(-1,8))
# Stationarity alone does not imply an extremum; constrained scalar KKT.
for power,sgn in [(2,1),(2,-1),(3,1)]:
    close(fd(lambda z:sgn*(z[0]-2)**power,[2],0),0)
equal(2*1-2,0); equal(2*(1-1),0)

# Full 3x3 elimination shown in the mathematical tools block.
A3=[[2,1,-1],[1,-1,1],[1,1,1]]; rhs3=[1,2,4]
equal(solve(A3,rhs3),[1,1,2]); equal(mv(A3,[1,1,2]),rhs3)
M=[[F(v) for v in row] for row in [[1,-1,1,2],[2,1,-1,1],[1,1,1,4]]]
row_sub(M,1,0,2); row_sub(M,2,0,1)
equal(M,[[1,-1,1,2],[0,3,-3,-3],[0,2,0,2]])
M[1]=[v/3 for v in M[1]]; row_sub(M,2,1,2)
equal(M,[[1,-1,1,2],[0,1,-1,-1],[0,0,2,4]])
equal([2-2*1,2-2*1,2-2*1],[0,0,0])
equal([2-2*1,2-2*1,3-2*1],[0,0,1])

# Recompute RBF values independently from the stated distances and bandwidth.
sigma_squared=2/log(2)
rbf=lambda x,z: exp(-(x-z)**2/(2*sigma_squared))
close(rbf(0,0),1); close(rbf(0,2),F(1,2)); close(rbf(2,2),1)
close(rbf(0,4),F(1,16)); close(rbf(2,4),F(1,2)); close(rbf(0,1),2**(-.25)); close(rbf(2,1),2**(-.25))
K=[[F(1),F(1,2)],[F(1,2),F(1)]]; y=[1,5]
def regression(gamma):
    H=[[K[i][j]+(F(1)/gamma if i==j else 0) for j in range(2)] for i in range(2)]
    system=[H[0]+[1],H[1]+[1],[1,1,0]]
    sol=solve(system,y+[0]); a=sol[:2]; b=sol[2]
    fitted=[v+b for v in mv(K,a)]; residual=[yi-fi for yi,fi in zip(y,fitted)]
    equal(mv(system,sol),y+[0]); equal(sum(a),0); equal(a,[gamma*e for e in residual])
    equal([fi+e for fi,e in zip(fitted,residual)],y)
    objective=F(1,2)*dot(a,mv(K,a))+gamma*F(1,2)*dot(residual,residual)
    return a,b,fitted,residual,objective

a,b,fitted,e,J=regression(F(2))
equal(a,[F(-2),F(2)]); equal(b,3); equal(fitted,[2,4]); equal(e,[-1,1]); equal(J,4)
close(sum(ai*rbf(xi,1) for ai,xi in zip(a,[0,2]))+b,3)
close(sum(ai*rbf(xi,4) for ai,xi in zip(a,[0,2]))+b,F(31,8))
M=[[F(v) for v in row] for row in [[1,1,0,0],[F(1,2),F(3,2),1,5],[F(3,2),F(1,2),1,1]]]
row_sub(M,1,0,F(1,2)); row_sub(M,2,0,F(3,2))
equal(M,[[1,1,0,0],[0,1,1,5],[0,-1,1,1]])
row_sub(M,2,1,-1); equal(M[2],[0,0,2,6])
a,b,fitted,e,J=regression(F(1))
equal(a,[F(-4,3),F(4,3)]); equal(b,3); equal(fitted,[F(7,3),F(11,3)])
equal(e,[F(-4,3),F(4,3)]); equal(J,F(8,3))
close(sum(ai*rbf(xi,1) for ai,xi in zip(a,[0,2]))+b,3)

# Classification: build Q from labels, solve, reconstruct w, verify KKT.
cx=[-1,1]; cy=[-1,1]; CK=[[xi*xj for xj in cx] for xi in cx]
CQ=[[cy[i]*cy[j]*CK[i][j] for j in range(2)] for i in range(2)]
equal(CK,[[1,-1],[-1,1]]); equal(CQ,[[1,1],[1,1]])
CA=[[CQ[i][j]+(1 if i==j else 0) for j in range(2)]+[cy[i]] for i in range(2)]+[cy+[0]]
equal(CA,[[2,1,-1],[1,2,1],[-1,1,0]])
csol=solve(CA,[1,1,0]); equal(csol,[F(1,3),F(1,3),0])
ca=csol[:2]; cb=csol[2]; cw=sum(ai*yi*xi for ai,yi,xi in zip(ca,cy,cx))
equal(cw,F(2,3)); equal(cw*F(3,2)+cb,1)
cg=[cw*xi+cb for xi in cx]; ce=[1-yi*gi for yi,gi in zip(cy,cg)]
equal(cg,[F(-2,3),F(2,3)]); equal(ce,[F(1,3),F(1,3)]); equal(ce,ca); equal(dot(cy,ca),0)
equal([yi*gi+ei for yi,gi,ei in zip(cy,cg,ce)],[1,1])
equal(F(1,2)*cw*cw+F(1,2)*dot(ce,ce),F(1,3))
# Dense usually does not mean every coefficient must be nonzero.
dx=[0,1,2]; dy=[1,2,2]; da=[F(-1,3),F(1,3),F(0)]; db=F(4,3)
dw=dot(da,dx); equal(dw,F(1,3)); df=[dw*xi+db for xi in dx]
equal(df,[F(4,3),F(5,3),2]); equal([yi-fi for yi,fi in zip(dy,df)],da); equal(sum(da),0)
print(f'PASS: {checks} independent mathematics / LS-SVM arithmetic checks (stdlib only).')
