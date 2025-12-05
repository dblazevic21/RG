public class Singleton1
{
  private static volatile Singleton INSTANCE;

  private Singleton () {}

  public static Singleton getInstance() 
  {
    IF (INSTANCE == null)
    {
      syncrhonized(Singleton.class)
      {
        if(INSTANCE == null)
        {
          INSTANCE = new Singleton();
        }
      }
      return INSTANCE;
    }
  }
}


public class Singleton2
{
  private static Singleton INSTANCE = new Singleton();

  private Singleton () {}

  public static Singleton getInstance()
  {
    return INSTANCE;
  }
}

public class Singleton3
{
  private static Singleton INSTANCE;

  static 
  {
    INSTANCE = new Singleton();
  }

  private Singleton () {}

  public static Singleton getInstance()
  {
    return INSTANCE;
  }
}

// Product
public class ScubaDiver 
{
  private String name;
  private int year;

  public ScubaDiver() {}

  public ScubaDiver(String name, int year) 
  {
    this.name = name;
    this.year = year;
  }
}

// Builder
public interface ScubaDiverBuilder
{
  public ScubaDiverBuilder kreirajScubaDivera(String name, int year);
  public ScubaDiver getScubaDiver();
}

// Concrete Builder
public class ScubaDiverBuilderConcrete implements ScubaDiverBuilder
{
  protected ScubaDiver scubaDiver;

  public ScubaDiverBuilderConcrete() {}

  public ScubaDiverBuilder kreirajScubaDivera(String name, int year) 
  {
    scubaDiver = new ScubaDiver(name, year);
    return this;
  }
}

// Director
public class ScubaDiverDirector
{
  private ScubaDiverBuilder builder;

  public ScubaDiverDirector() 
  {
    this.builder = new ScubaDiverBuilderConcrete();
  }

  public ScubaDiverDirector (final ScubaDiverBuilder builder) 
  {
    this.builder = builder;
  }
}

// Client

public class MyClass
{
  public static void main (String args[])
  {
    ScubaDiverBuilder builder = new ScubaDiverBuilderConcrete();
    ScubaDiverDirector director = new ScubaDiverDirector(builder);
    ScubaDiver diver = builder.kreirajScubaDivera("John Doe", 2020).getScubaDiver();
  }
}

// Client 2
public class MyClass2
{
  public static void main (String args[])
  {
    ScubaDiverDirector director = new ScubaDiverDirector();
    ScubaDiver diver = director.builder.kreirajScubaDivera("Jane Doe", 2021).getScubaDiver();
  }
}

// Product
public abstract class DiveGroup
{
  protected List<ScubaDiver> divers;
  public abstract int maxDepth();

  public List<ScubaDiver> getDivers()
  {
    return divers;
  }
}

// Concrete Product
public class PairDiving extends DiveGroup
{
  public PairDiving(ScubaDiver diver1, ScubaDiver diver2)
  {
    super();
    this.divers.add(diver1);
    this.divers.add(diver2);
  }

  public int maxDepth()
  {
    var maxDepth1 = divers.get(0).getMaxDepth();
    var maxDepth2 = divers.get(1).getMaxDepth();
    if (maxDepth1 < maxDepth2)
    {
      return maxDeepth1;
    }
    else
    {
      return maxDepth2;
    }
  }
}

// Concrete Product
public class SoloDiving extends DiveGroup
{
  public SoloDiving(ScubaDiver diver1)
  {
    super();
    this.divers.add(diver1);
  }

  public int maxDepth()
  {
    var maxDepth1 = divers.get(0).getMaxDepth();
    return maxDepth1;
  }
}

// Creator
public abstract class DiveCreator
{
  private final List<DiveGroup> diveGroups = new ArrayList<>();

  protected abstract DiveGroup createDiveGroup(List<ScubaDiver> divers) throws Exception;
}

// Concrete Creator 
public class DiveWith extends DiveCreator
{
  @Override
  protected PairDiving createDiveGroup(List<ScubaDivers> nesto)
  {
    return new PairDiving(nesto.get(0), nesto.get(1));
  }
}

// Product 
public abstract class Room
{

}

// Concrete Product
public class SingleRoom extends Room
{

}

//Creator
public abstract class RoomCreator
{
  private final List<Room> rooms = new ArrayList<>();

  public MazeGame()
  {
    Room room1 = createRoom();
    rooms.add(room1);
  }

  protected abstract Room createRoom();
}

// Concrete Creator
public class SingleRoomCreator extends RoomCreator
{
  @Override
  protected Room createRoom()
  {
    return new SingleRoom();
  }
}

// Prototype
public interface ScubaPrototype
{
  Object clone();
}

// Concrete Prototype
public class DiveLogBoat extends ScubaPrototype
{
  protected String boatName;

  public DiveLogBoat(String boatName)
  {
    this.boatName = boatName;
  }

  public DiveLogBoat (DiveLogBoat target)
  {
    super(target);
    if (target != null)
    {
      this.boatName = target.boatName;
    }
  }

  @Override
  public DiveLogBoat clone()
  {
    return new DiveLogBoat(this);
  }
}

// Adaptee
public class ScubaDiver2
{
  private String name;
  private int year;
}

// Target
public interface FreeDiver
{
  public String getNameAndSurname();

  public int getYearOfMembership();
}

// Adapter
public class ScubaDiverAdapter implements FreeDiver
{
  private ScubaDiver2 diver;

  public ScubaDiverAdapter() {}

  public ScubaDiverAdapter(String name, int year)
  {
    this.diver = new ScubaDiver2();
    this.diver.setName(name);
    this.diver.setYear(year);
  }

  public String getNameAndSurname()
  {
    return diver.getName();
  }
  public int getYearOfMembership()
  {
    return diver.getYear();
  }
}

// Client
public class MyClass3
{
  public static void main(String args[])
  {
    ScubaDiver diver = new ScubaDiverAdapter("John Smith", 2019);

    FreeDiver freeDiver = new ScubaDiverAdapter("Jane Smith", 2020);
  }
}

// Implementor
public interface Implementor
{
  void operationImpl();
}

// Concrete Implementors

public class ConcreteImplementorA implements Implementor 
{
    @Override
    public void operationImpl() 
    {
        System.out.println("ConcreteImplementorA operation implementation.");
    }
}

public class ConcreteImplementorB implements Implementor 
{
    @Override
    public void operationImpl() 
    {
        System.out.println("ConcreteImplementorB operation implementation.");
    }
}

// Abstraction

public abstract class Abstraction
{
  protected Implementor implementor;

  public Abstraction(Implementor implementor) 
  {
    this.implementor = implementor;
  }

  public abstract void operation();
}

// Refined Abstraction
public class RefinedAbstraction extends Abstraction 
{
    public RefinedAbstraction(Implementor implementor) {
        super(implementor);
    }

    @Override
    public void operation() 
    {
        System.out.print("RefinedAbstraction operation: ");
        implementor.operationImpl();
    }
}

// Main

public class BridgePatternDemo 
{
    public static void main(String[] args) 
    {
        Implementor implementorA = new ConcreteImplementorA();
        Abstraction abstractionA = new RefinedAbstraction(implementorA);
        abstractionA.operation();

        Implementor implementorB = new ConcreteImplementorB();
        Abstraction abstractionB = new RefinedAbstraction(implementorB);
        abstractionB.operation();
    }
}

// SUbject

public interface ScoringSubject
{
  public void setCompetitor (Competitor competitor) throws Exception;

  public String bestCategory() throws Exception;
}

// Real subject
public class Scoring implements ScoringSubject
{


}

